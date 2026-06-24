---
layout: lesson
lesson_id: "0019"
chapter: 3
chapter_title: "Production AI Backends"
title: "Pydantic for input/output validation"
description: "30–40 min read · Hands-on coding"
prev: "0018-fastapi-basics.html"
prev_title: "FastAPI fundamentals"
next: "0020-async-python.html"
next_title: "Async Python — why it matters for AI"
prereqs:
  - "[Lesson 4](0004-structured-outputs.html): Pydantic BaseModel basics — this lesson builds on that foundation"
  - "[Lesson 18](0018-fastapi-basics.html): FastAPI request/response models — you will make those more robust here"
assignment:
  article:
    title: "Pydantic: Simplifying Data Validation in Python"
    url: "https://realpython.com/python-pydantic/"
    author: "Real Python"
    time: "about 15 minutes (\"Creating Models\", \"Field Types and Constraints\", and \"Validators\" sections)"
    why: "This tutorial covers Pydantic in isolation from FastAPI, which helps you see it as a general-purpose validation tool — not just a FastAPI feature. The examples use different domains from this lesson, which reinforces the concepts through varied practice."
  task:
    description: "Harden the AI backend from Lesson 18."
    steps:
      - "Take your Lesson 18 `main.py` and upgrade every model with proper `Field()` constraints (min/max lengths, numeric ranges)"
      - "Add a `@field_validator` to `ChatRequest` that rejects messages containing only whitespace, and strips whitespace before storing"
      - "Create a `DocumentAnalysis` nested model (summary, list of key points as strings, estimated reading time in minutes as int). Add a `POST /analyze` endpoint that calls the LLM and parses the result into this model"
      - "Wrap the LLM JSON parsing in a try/except for both `json.JSONDecodeError` and `pydantic.ValidationError`, returning a 500 with a useful error message if either occurs"
    expected: "A `/docs` page where all constraints are visible, and a `/analyze` endpoint that returns structured JSON even when tested with an unusual input."
    why: "Production AI backends fail most often at the validation layer — either accepting bad input silently or crashing on unexpected LLM output. Building the habit of explicit, constrained models now prevents a whole class of production incidents later."
knowledge_check:
  - q: "What is the difference between `@field_validator` and `@model_validator`?"
    a: "`@field_validator` validates a single field in isolation — it receives just that field's value. `@model_validator` validates the whole model — it runs after all fields are validated and can cross-check multiple fields against each other. Use `@model_validator` when validity depends on combinations of fields (e.g. \"stream and json_mode cannot both be True\")."
    section: "#field-validators"
    section_title: "Field validators"
  - q: "Why does a field validator that cleans data (e.g. strips whitespace) need to *return* the cleaned value?"
    a: "Pydantic uses the return value of a field validator as the field's new value. If you strip whitespace but return `None` or forget the return statement, the cleaned value is discarded and the field keeps its original (uncleaned) value. Always return the value you want to store."
    section: "#field-validators"
    section_title: "Field validators"
  - q: "What two exceptions should you always catch when parsing LLM JSON output with Pydantic?"
    a: "**`json.JSONDecodeError`** — the LLM returned something that is not valid JSON at all. **`pydantic.ValidationError`** — the JSON parsed correctly but the content doesn't match the model schema (wrong types, missing required fields, constraint violations)."
    section: "#validating-llm-output"
    section_title: "Validating LLM output"
  - q: "What does `model_config = ConfigDict(extra=\"forbid\")` do, and when would you use it?"
    a: "It causes Pydantic to reject any request that contains fields not defined in the model, returning a 422 error. Use it on request models when you want strict API contracts — callers can't accidentally send undocumented fields that might be confused with real fields or cause unexpected behaviour."
    section: "#model-config"
    section_title: "Useful model configuration"
additional_resources:
  - title: "Pydantic v2 documentation"
    url: "https://docs.pydantic.dev/latest/"
    desc: "The definitive reference; especially the validators section"
  - title: "Pydantic validators reference"
    url: "https://docs.pydantic.dev/latest/concepts/validators/"
    desc: "All validator types with examples"
  - title: "FastAPI request body tutorial"
    url: "https://fastapi.tiangolo.com/tutorial/body/"
    desc: "FastAPI's own guide to Pydantic integration"
---

## Motivation

In Lesson 4 you used Pydantic to parse structured LLM output — the LLM returned JSON, and Pydantic checked that it matched your schema. That was one half of the picture. The other half is validation at the API boundary: checking that everything coming *in* to your system is valid, and that everything going *out* is safe.

AI backends fail in two distinct places. The first is the LLM itself — it might return garbage. The second is the caller — it might send you a 50,000-word document when your prompt budget allows 2,000, or a temperature of 100 when you expect 0–2. Without Pydantic enforcing both sides, production bugs hide until they hit real users.

{% include prereqs.html %}

## Why plain dicts break AI apps {#plain-dicts-problem}

A plain Python dictionary has no memory. Once you create it, you can add, rename, or remove keys freely — Python won't complain. In a small script that is fine. In a production API with ten engineers and ten endpoints, it is the source of a whole class of subtle bugs:

```python
# Without Pydantic — any of these silently pass:
def chat(request: dict):
    model = request["model"]          # KeyError if caller forgot this field
    temp = request.get("temperature") # None if not sent — then what?
    tokens = request["max_tokens"]    # Might be "1000" (string) not 1000 (int)
    # The LLM call will blow up with a confusing error deep in the stack
```

With Pydantic, the error surfaces immediately with a clear message, before your function runs, before the LLM call, before the money is spent:

```python
class ChatRequest(BaseModel):
    message: str
    model: str = "gpt-4o-mini"
    temperature: float = 0.7  # Default applied, type coerced

# If the caller sends {"message": 42} → ValidationError: message must be str
# If the caller omits temperature → default 0.7 is applied
# If the caller sends temperature="hot" → ValidationError: must be float
```

<div class="callout info">
<strong>The rule:</strong> validate at every boundary. A boundary is any place where data crosses from code you control into code you don't (or vice versa): HTTP requests, LLM responses, database reads, file parses, environment variables.
</div>

## Field constraints with `Field()` {#field-constraints}

Pydantic's `Field()` function lets you add constraints directly in the model definition. FastAPI uses these constraints to both validate incoming data and to document the valid range in `/docs`:

```python
from pydantic import BaseModel, Field
from typing import Literal

class ChatRequest(BaseModel):
    message: str    = Field(...,     min_length=1,   max_length=4000,
                           description="The user's message")
    model: str      = Field("gpt-4o-mini",
                           description="The OpenAI model to use")
    temperature: float = Field(0.7, ge=0.0, le=2.0,
                              description="Sampling temperature (0=deterministic, 2=creative)")
    max_tokens: int = Field(1000,   ge=1,    le=4096,
                           description="Max tokens to generate")
```

Key constraint arguments:

| Argument | Meaning | For |
|---|---|---|
| `...` | Required (no default) | Any type |
| `min_length`, `max_length` | Length bounds | str, list |
| `ge`, `le` | Greater-or-equal, less-or-equal | int, float |
| `gt`, `lt` | Strictly greater/less than | int, float |
| `pattern` | Regex pattern the string must match | str |
| `description` | Appears in OpenAPI docs | Any type |

## Nested models for complex AI responses {#nested-models}

A model can contain other models. This is how you represent structured LLM outputs that have nested structure — a document analysis that produces a list of entities, each with a type and confidence score:

```python
from pydantic import BaseModel, Field
from typing import Literal

class Entity(BaseModel):
    text: str
    entity_type: Literal["person", "organization", "location", "date", "product"]
    confidence: float = Field(ge=0.0, le=1.0)

class Sentiment(BaseModel):
    label: Literal["positive", "negative", "neutral"]
    score: float = Field(ge=0.0, le=1.0)
    reasoning: str

class DocumentAnalysis(BaseModel):
    summary: str       = Field(max_length=500)
    sentiment: Sentiment
    entities: list[Entity]
    language: str      = Field(default="en")
    word_count: int
```

When FastAPI returns a `DocumentAnalysis` as a response model, it recursively validates every `Entity` in the list and every field of `Sentiment`. A single invalid nested field causes the whole response to fail validation — exactly what you want.

You can also use nested models for requests. A conversation history looks like:

```python
class Message(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str = Field(min_length=1)

class ConversationRequest(BaseModel):
    messages: list[Message] = Field(min_length=1, max_length=50)
    model: str = "gpt-4o-mini"
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)
```

## Optional fields and union types {#optional-union}

Not every field is required. Use `Optional` (or the `| None` syntax) for fields that may not be present. Pydantic treats `Optional[str]` as "this field may be a string or may be absent":

```python
from typing import Optional

class SummarizeRequest(BaseModel):
    text: str          = Field(..., min_length=10)
    max_words: int     = Field(150, ge=50, le=1000)
    focus_on: Optional[str] = None   # Optional hint to guide the summary
    language: str | None   = None    # Python 3.10+ union syntax — same thing
```

`Union` types let a field accept multiple types. This is useful when an LLM might return either a string or a structured object depending on the query:

```python
from typing import Union

class SimpleAnswer(BaseModel):
    answer: str

class DetailedAnswer(BaseModel):
    answer: str
    sources: list[str]
    confidence: float

class QueryResponse(BaseModel):
    result: Union[SimpleAnswer, DetailedAnswer]  # either is valid
```

## Field validators {#field-validators}

Sometimes the type system alone is not enough. You need to run custom logic — for instance, checking that a model name is one your system supports, or that a date is in the future. Pydantic's `@field_validator` runs custom code after the type check:

```python
from pydantic import BaseModel, Field, field_validator

SUPPORTED_MODELS = {"gpt-4o", "gpt-4o-mini", "claude-sonnet-4-6", "claude-haiku-4-5"}

class ChatRequest(BaseModel):
    message: str   = Field(..., min_length=1, max_length=4000)
    model: str     = Field("gpt-4o-mini")
    temperature: float = Field(0.7, ge=0.0, le=2.0)

    @field_validator("model")
    @classmethod
    def model_must_be_supported(cls, v: str) -> str:
        if v not in SUPPORTED_MODELS:
            raise ValueError(
                f"Unsupported model '{v}'. Choose from: {sorted(SUPPORTED_MODELS)}"
            )
        return v

    @field_validator("message")
    @classmethod
    def message_must_not_be_empty_whitespace(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Message cannot be only whitespace")
        return stripped    # Return the cleaned value
```

The validator is a class method decorated with `@field_validator("field_name")`. If it raises `ValueError`, Pydantic wraps it in a `ValidationError` and FastAPI returns a 422 with a clear error message.

Notice the second validator returns `stripped` — a validator can clean data as well as reject it.

### Model validators — validating across fields

Sometimes the validity of one field depends on another. For instance, if the caller requests streaming output, they must not also request structured JSON output:

```python
from pydantic import BaseModel, model_validator

class GenerateRequest(BaseModel):
    prompt: str
    stream: bool = False
    json_mode: bool = False

    @model_validator(mode="after")
    def stream_and_json_incompatible(self) -> "GenerateRequest":
        if self.stream and self.json_mode:
            raise ValueError("Cannot use stream=True and json_mode=True together")
        return self
```

A `@model_validator(mode="after")` runs after all fields have been validated individually. It receives the fully-constructed model instance and can inspect any combination of fields.

## Validating LLM output in practice {#validating-llm-output}

In an AI backend, LLM output is the most dangerous unvalidated data you handle. The model may return malformed JSON, fields of the wrong type, or fields that fail your constraints. The pattern is: ask the LLM to return JSON, parse it with Pydantic, handle validation errors gracefully:

```python
import json
from pydantic import BaseModel, ValidationError
from fastapi import HTTPException

class ClassificationResult(BaseModel):
    label: str
    confidence: float  = Field(ge=0.0, le=1.0)
    reasoning: str     = Field(max_length=300)

def classify_text(text: str, labels: list[str], client) -> ClassificationResult:
    prompt = f"""Classify the following text into one of these categories: {labels}

Respond with ONLY valid JSON in this exact format:
{{"label": "chosen_label", "confidence": 0.95, "reasoning": "one sentence explanation"}}

Text to classify:
<text>{text}</text>"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},   # force JSON output
    )

    raw = response.choices[0].message.content

    try:
        data = json.loads(raw)
        result = ClassificationResult(**data)
    except json.JSONDecodeError:
        raise HTTPException(500, f"LLM returned invalid JSON: {raw[:100]}")
    except ValidationError as e:
        raise HTTPException(500, f"LLM output failed validation: {e.errors()}")

    # Validate label is actually one we asked for
    if result.label not in labels:
        raise HTTPException(500, f"LLM chose label '{result.label}' not in {labels}")

    return result
```

The key insight here is that `ValidationError` and `json.JSONDecodeError` are expected failure modes for LLM output, not exceptional ones. You should always wrap LLM JSON parsing in error handling.

<div class="callout warning">
<strong>Retry on validation failure:</strong> When LLM output fails validation, the right response is often to retry the call with a stronger prompt — not to return a 500 to the user. In a production system you would retry 1–2 times before giving up. You will build this pattern in Lesson 24 (background workers) where retries are safe.
</div>

## Useful model configuration {#model-config}

Pydantic lets you configure model behaviour at the class level using `model_config`:

```python
from pydantic import BaseModel, ConfigDict

class StrictChatRequest(BaseModel):
    model_config = ConfigDict(
        extra="forbid",        # reject any extra fields the caller sends
        str_strip_whitespace=True,  # strip leading/trailing whitespace from all str fields
        frozen=True,           # make instances immutable after creation
    )

    message: str
    model: str = "gpt-4o-mini"
```

The most useful options for AI APIs:

| Option | What it does |
|---|---|
| `extra="forbid"` | Reject requests with unknown fields (prevents callers from accidentally sending irrelevant data) |
| `extra="ignore"` | Accept requests with extra fields, silently ignore them (default) |
| `str_strip_whitespace=True` | Automatically strip whitespace from all string fields |
| `frozen=True` | Make the model immutable — useful for response objects you don't want mutated |
| `populate_by_name=True` | Allow fields to be set by their Python name even when they have a `Field(alias=...)` |
