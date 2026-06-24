---
layout: lesson
lesson_id: "0014"
chapter: 2
chapter_title: "AI System Design"
title: "Evaluator-optimizer and LLM routers"
description: "35–40 min read · Hands-on coding"
prev: "0013-agentic-loops.html"
prev_title: "Agentic loops — letting the LLM decide what to do next"
next: "P004-document-pipeline.html"
next_title: "Project: Document pipeline"
prereqs:
  - "[Lesson 11](0011-llm-chaining.html): chaining — both patterns are specialised chains"
  - "[Lesson 4](0004-structured-outputs.html): Pydantic structured outputs — both patterns depend on typed intermediate values"
assignment:
  article:
    title: "Building Effective Agents"
    url: "https://www.anthropic.com/engineering/building-effective-agents"
    author: "Anthropic"
    time: "about 10 minutes (sections \"Workflow: Evaluator-optimizer\" and \"Routing\" only)"
    why: "Anthropic's production guidance on exactly these two patterns, with real criteria for when each one earns its added complexity."
  task:
    description: "Build an LLM router for a multi-category content moderation system."
    steps:
      - "Define a `ModerationDecision` Pydantic model with fields: `category` (Literal: \"safe\", \"spam\", \"hate\", \"misinformation\", \"adult\"), `action` (Literal: \"approve\", \"flag\", \"block\"), `confidence` (str), `reason` (str)"
      - "Write a `moderate(text: str) -> ModerationDecision` function"
      - "Test it with 8 text samples (2 safe, 2 spam, 2 borderline) and print each decision"
      - "Add an evaluator-optimizer on top: if confidence is \"low\", run an evaluator LLM call that double-checks the decision and returns a revised one"
    expected: "A table of results — text snippet, category, action, confidence, reason — for all 8 samples."
    why: "Content moderation is one of the highest-volume, most financially-sensitive AI applications. Building a version from scratch gives you intuition for why the router + evaluator combination is standard practice in production."
knowledge_check:
  - q: "What two LLM calls does the evaluator-optimizer pattern use, and what does each one do?"
    a: "The **generator** produces a draft output. The **evaluator** scores that draft against specific criteria and provides actionable feedback. If the draft fails, the feedback is included in the next generator call. The loop repeats until the output passes or the iteration limit is reached."
    section: "#evaluator-optimizer"
    section_title: "The evaluator-optimizer pattern"
  - q: "Why should LLM router categories be mutually exclusive and limited to 5–7?"
    a: "Overlapping categories cause inconsistent classification — the same message might be routed differently each time depending on subtle phrasing. Classification accuracy also drops as the number of categories increases. Beyond 7, a two-level routing hierarchy (broad → narrow) is more reliable than a flat list."
    section: "#llm-routers"
    section_title: "Router design guidelines"
  - q: "Why should you use the cheapest model for routing?"
    a: "Routing is a classification task, not a reasoning task. Cheap, fast models like `gpt-4o-mini` or Haiku classify as accurately as expensive models for well-defined categories. Since the router runs on every request, using a cheap model cuts the per-request cost of routing to near zero."
    section: "#llm-routers"
    section_title: "LLM routers"
additional_resources:
  - title: "Building Effective Agents"
    url: "https://www.anthropic.com/engineering/building-effective-agents"
    desc: "Full article; covers orchestrator-subagent patterns and parallelization in addition to evaluator and routing"
---

## Motivation

Two recurring design problems appear across every category of production AI system. First: how do you improve the quality of a generated output without human review on every request? Second: how do you route different types of requests to the right handler without an unwieldy chain of conditionals?

The evaluator-optimizer pattern and the LLM router pattern each solve one of these problems elegantly. Both are self-contained architectural building blocks you can drop into any system — and both appear in the Chapter Project you are about to build.

{% include prereqs.html %}

## Part 1: The evaluator-optimizer pattern {#evaluator-optimizer}

### What it is

The evaluator-optimizer pattern uses two LLM calls in a feedback loop: one **generator** produces a draft, and one **evaluator** scores that draft against specific criteria. If the score is below a threshold, the generator is called again with the evaluator's feedback as additional context. The loop repeats until the output is good enough or a maximum number of iterations is reached.

```text
Generator  ──▶  Draft output
                    │
                    ▼
              Evaluator  ──▶  EvaluationResult (score, feedback, pass/fail)
                    │
                ┌───┴────────────────┐
                │ pass               │ fail
                ▼                   ▼
           Return draft      Generator (with feedback)
                                    │
                                 (loop)
```

### When to use it

- Content generation where quality standards are measurable: email tone, legal accuracy, factual correctness
- Code generation that must pass test cases
- Translations that must meet a fluency bar
- Any task where "good enough" has a clear, articulable definition

The key requirement: the evaluator must be able to give actionable feedback, not just a score. "This email is too formal" is actionable. "This is bad" is not.

### Implementation

```python
import os
from dotenv import load_dotenv
from openai import OpenAI
from pydantic import BaseModel

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class EvaluationResult(BaseModel):
    score: int           # 1–10
    passes: bool         # True if score >= threshold
    feedback: str        # actionable: what to fix if not passing
    strengths: list[str]

def generate_email(task: str, feedback: str = "") -> str:
    feedback_block = f"\n\nPrevious attempt feedback to address:\n{feedback}" if feedback else ""
    r = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are an expert email writer. Write professional, warm, concise emails."},
            {"role": "user",   "content": f"{task}{feedback_block}"},
        ],
    )
    return r.choices[0].message.content

def evaluate_email(email: str, criteria: str) -> EvaluationResult:
    r = client.beta.chat.completions.parse(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a senior communications editor. Evaluate emails strictly."},
            {"role": "user",   "content": f"Evaluate this email against these criteria:\n{criteria}\n\nEmail:\n{email}"},
        ],
        response_format=EvaluationResult,
    )
    return r.choices[0].message.parsed

def generate_with_eval(task: str, criteria: str, max_iterations: int = 3) -> str:
    feedback = ""
    for i in range(max_iterations):
        draft = generate_email(task, feedback)
        evaluation = evaluate_email(draft, criteria)

        print(f"Iteration {i+1}: score={evaluation.score}/10, pass={evaluation.passes}")

        if evaluation.passes:
            return draft       # good enough

        feedback = evaluation.feedback   # retry with evaluator's notes

    return draft   # return best effort after max iterations
```

### Design guidelines

- **Keep criteria specific and measurable.** "Under 150 words, warm tone, ends with a clear call to action" — not "good quality".
- **Cap iterations at 3–5.** Beyond that, returns diminish. If quality is still poor at iteration 5, the problem is in the generator prompt.
- **Consider the cost.** Each iteration is two LLM calls. Three iterations = six calls. Use a cheaper model for the evaluator.
- **Use a different system prompt for generator and evaluator.** They have different jobs; mixing them produces confused outputs.

## Part 2: LLM routers {#llm-routers}

### What it is

An **LLM router** is a single, fast, cheap LLM call whose only job is to classify an incoming request and dispatch it to the right handler. The router produces a structured classification; your code uses that classification to call the appropriate next step.

This solves a real production problem: you cannot give one LLM 40 different tools and expect it to use them correctly. The model gets confused, picks the wrong tool, and hallucinates capabilities. Instead, route the request to a specialised sub-system that has only the 3–5 tools relevant to it.

```text
Incoming request
       │
       ▼
  [Router LLM]  ──▶  RouteDecision (intent, handler, confidence)
       │
   ┌───┼───────────────┐
   │   │               │
   ▼   ▼               ▼
[Billing] [Technical] [Account]
 handler   handler     handler
```

### Implementation

```python
from pydantic import BaseModel
from typing import Literal

class RouteDecision(BaseModel):
    intent: Literal["billing", "technical", "account", "general", "escalate"]
    confidence: str   # "high" | "medium" | "low"
    reason: str       # one sentence explaining the classification

def route_request(user_message: str) -> RouteDecision:
    r = client.beta.chat.completions.parse(
        model="gpt-4o-mini",     # use the cheapest model for routing
        messages=[
            {
                "role": "system",
                "content": """Classify this customer support request.

Intents:
- billing: payment issues, invoices, charges, refunds, subscription
- technical: bugs, errors, setup, integrations, API issues
- account: login, password, account settings, data export
- general: product questions, feature requests, how-to
- escalate: angry customer, legal threats, urgent safety issues""",
            },
            {"role": "user", "content": user_message},
        ],
        response_format=RouteDecision,
    )
    return r.choices[0].message.parsed

# ── Dispatcher ────────────────────────────────────────────────
HANDLERS = {
    "billing":   handle_billing,
    "technical": handle_technical,
    "account":   handle_account,
    "general":   handle_general,
    "escalate":  handle_escalation,
}

def process_request(user_message: str) -> str:
    decision = route_request(user_message)

    if decision.confidence == "low":
        # Fall back to a general handler if the router is unsure
        return handle_general(user_message)

    handler = HANDLERS[decision.intent]
    return handler(user_message)
```

### Router design guidelines

- **Use the cheapest model.** The router's job is classification, not reasoning. `gpt-4o-mini` or `claude-haiku-4-5-20251001` is always sufficient.
- **Keep categories mutually exclusive.** If "billing" and "subscription" overlap, the model will be inconsistent. Merge them or add tiebreaker rules.
- **Handle low-confidence gracefully.** A router that is unsure should fall back, not guess. Low-confidence routes are worth logging for quality analysis.
- **Use `Literal` in the output type.** `Literal["billing", "technical", ...]` constrains the model to your exact category list — no typos, no invented categories.
- **Limit categories to 5–7.** Beyond that, classification accuracy drops. If you have more categories, add a two-level hierarchy: broad router → narrow sub-router.

## Combining both patterns {#combining}

In the Chapter Project (P006), the research assistant uses both:

- A **router** classifies the incoming query as "factual lookup", "data analysis", or "opinion/synthesis" and dispatches to the appropriate sub-agent.
- An **evaluator-optimizer** scores the final report for factual grounding and completeness, and requests the sub-agent to retry if the score is below 7/10.

Together they form a system where every request gets the right treatment and every output meets a quality bar — without human review in the loop.
