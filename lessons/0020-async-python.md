---
layout: lesson
lesson_id: "0020"
chapter: 3
chapter_title: "Production AI Backends"
title: "Async Python — why it matters for AI"
description: "30–40 min read · Hands-on coding"
prev: "0019-pydantic-validation.html"
prev_title: "Pydantic for input/output validation"
next: "P007-ai-rest-api.html"
next_title: "Project: Build an AI-powered REST API"
prereqs:
  - "[Lesson 18](0018-fastapi-basics.html): FastAPI basics — you will make those routes async"
  - "[Lesson 11](0011-llm-chaining.html): LLM chaining and parallel calls — async is how that parallelism works in a real server"
assignment:
  article:
    title: "Async IO in Python: A Complete Walkthrough"
    url: "https://realpython.com/async-io-python/"
    author: "Real Python"
    time: "about 20 minutes (\"The asyncio Package and async/await\", \"A Full Program: Asynchronous Requests\", and \"Async IO Design Patterns\" sections)"
    why: "This is the best practitioner guide to Python's asyncio. The \"Async IO Design Patterns\" section is especially useful — it shows common idioms (producer/consumer, semaphores, queues) that come up in AI batch processing systems."
  task:
    description: "Upgrade the Lesson 18 API to be fully async."
    steps:
      - "Replace `OpenAI` with `AsyncOpenAI` throughout your `main.py`"
      - "Convert every route to `async def` and add `await` before every LLM call"
      - "Add a `POST /chat/batch` endpoint that accepts a list of up to 10 messages (as a list of strings) and returns replies for all of them using `asyncio.gather()`"
      - "Use `return_exceptions=True` in gather and handle any exceptions by including an error string in that position of the results list"
      - "Test it by calling `/chat/batch` with 5 different messages — all 5 replies should arrive together"
    expected: "A `/chat/batch` endpoint that returns all 5 replies in one response, much faster than 5 sequential calls would take."
    why: "Batch endpoints are one of the most common patterns in AI production — they're used everywhere from email classification pipelines to document processing queues. The gather pattern is the core skill."
knowledge_check:
  - q: "Why is async particularly valuable for AI backends compared to other kinds of web backends?"
    a: "LLM API calls take 2–10 seconds — far longer than typical database queries or file reads. A synchronous server handling ten concurrent LLM requests serves them one at a time, so the last user waits 20–100 seconds. Async lets all ten requests proceed concurrently, with each suspended at its `await` while the LLM responds, so all ten complete in roughly the time one takes."
    section: "#sync-vs-async"
    section_title: "The concurrency problem"
  - q: "What happens when you call a coroutine function without `await`?"
    a: "You get a coroutine object — the code inside the function does not run. Python (and mypy) will warn you about this. The function body only executes when the event loop schedules the coroutine, which requires either `await` or `asyncio.run()`."
    section: "#async-await"
    section_title: "async def and await"
  - q: "Why must you use `httpx.AsyncClient` (not `requests`) inside an async route?"
    a: "`requests` is synchronous — it blocks the thread while waiting for a network response. Inside an async route, blocking the thread blocks the entire event loop, which prevents all other pending requests from making progress. `httpx.AsyncClient` uses `await` internally, so it suspends only the current coroutine while the event loop continues handling other requests."
    section: "#httpx"
    section_title: "Async HTTP with httpx"
  - q: "What does `return_exceptions=True` do in `asyncio.gather()`?"
    a: "By default, if any coroutine in `gather()` raises an exception, the entire gather fails immediately. With `return_exceptions=True`, exceptions are caught and returned as values in the results list alongside successful results. This lets you handle partial failures in a batch — one failed document does not abort the whole batch."
    section: "#gather"
    section_title: "asyncio.gather"
additional_resources:
  - title: "asyncio — Python standard library docs"
    url: "https://docs.python.org/3/library/asyncio.html"
    desc: "The definitive reference for the full asyncio API"
  - title: "httpx documentation"
    url: "https://www.python-httpx.org/"
    desc: "Full reference for the async HTTP client"
  - title: "OpenAI AsyncOpenAI reference"
    url: "https://platform.openai.com/docs/api-reference/introduction"
    desc: "The async client methods are the same as sync but all are coroutines"
---

## Motivation

An LLM API call takes 2–10 seconds. A synchronous server handles one request at a time — while it is waiting for the LLM, every other user is blocked. With ten concurrent users, some wait up to 100 seconds for a response. Your server appears broken even though your code is correct.

Async Python solves this. Instead of blocking while waiting for the LLM, the server suspends the current request and handles other work. When the LLM responds, the suspended request resumes. The same server that blocked ten users in sequence can now handle hundreds concurrently. This is not optional for AI production — it is the baseline.

{% include prereqs.html %}

## The concurrency problem: synchronous vs asynchronous {#sync-vs-async}

Consider a restaurant analogy. A **synchronous** waiter takes one table's order, walks to the kitchen, stands there waiting while the chef cooks (2–10 minutes), carries the food back, then moves to the next table. All other tables wait, ignored.

An **asynchronous** waiter takes table one's order, submits it to the kitchen, then immediately takes table two's order while the kitchen works on both. When table one's food is ready, the kitchen signals the waiter, who delivers it. The waiter is never idle, and no table waits for another table's food to be cooked.

Your web server is the waiter. The LLM API is the kitchen. The "signal" mechanism is Python's async/await system, built on something called the **event loop**.

### The event loop

Python's event loop is a single-threaded scheduler. It runs one piece of code at a time, but it can *switch* between tasks at any point where a task explicitly yields control — specifically, at every `await` keyword. The loop looks like this in practice:

1. Start request A. Run it until the first `await` (waiting for LLM).
2. Suspend request A. Start request B. Run it until its first `await`.
3. Suspend request B. Check if A's LLM response arrived. If yes, resume A.
4. Continue cycling until all requests are complete.

No actual parallelism happens — there is only one thread. But because LLM calls spend 99% of their time *waiting for a network response*, a single thread can handle hundreds of them concurrently. The CPU is never the bottleneck.

## `async def` and `await` {#async-await}

To write async code, you need two new keywords.

`async def` defines a coroutine — a function that can be paused and resumed. A coroutine does not run when you call it; it returns a coroutine object that the event loop schedules:

```python
async def get_reply(message: str) -> str:
    # This is a coroutine — calling get_reply() doesn't run it yet
    result = await call_llm(message)
    return result
```

`await` pauses the current coroutine and gives control back to the event loop while waiting for the result. The event loop runs other coroutines until this one's result is ready, then resumes here.

You can only use `await` inside an `async def` function. And you can only `await` objects that support it — coroutines, or objects that implement the awaitable protocol (like `asyncio.sleep()` and async HTTP clients).

<div class="callout warning">
<strong>The chain rule:</strong> Once you make one function async, every caller of that function must also be async, and every caller of <em>those</em> functions, all the way up to where the event loop starts. This is why async code "spreads" through a codebase — it is not a bug, it is the design.
</div>

## Async HTTP with httpx {#httpx}

The standard Python HTTP library — `requests` — is synchronous. It blocks your thread while it waits for a network response. For an async server, this is exactly the wrong tool — it prevents the event loop from handling other requests during the wait.

**httpx** is a drop-in replacement for `requests` that supports async. Most of its API is identical to `requests`, so the migration is small:

```python
import httpx

# Synchronous (blocks the thread — wrong for async servers):
def fetch_sync(url: str) -> dict:
    response = requests.get(url)
    return response.json()

# Asynchronous (suspends the coroutine — right for async servers):
async def fetch_async(url: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()
```

The `async with` syntax creates an async context manager — it enters and exits the client in a way that the event loop can suspend around.

## Async LLM calls with the OpenAI SDK {#async-llm}

The OpenAI Python SDK ships with an async client: `AsyncOpenAI`. It has the exact same methods as the synchronous `OpenAI` client, but they are all coroutines you must `await`:

```python
import os
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()
async_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def get_reply(message: str) -> str:
    response = await async_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": message}],
    )
    return response.choices[0].message.content
```

The Anthropic SDK works the same way — use `AsyncAnthropic` instead of `Anthropic`, and `await` every call.

### Async routes in FastAPI

FastAPI supports both sync and async routes. Convert a sync route to async by adding `async` before `def`:

```python
from fastapi import FastAPI, Depends
from openai import AsyncOpenAI

app = FastAPI()

def get_async_client() -> AsyncOpenAI:
    return AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, client: AsyncOpenAI = Depends(get_async_client)):
    response = await client.chat.completions.create(   # ← await
        model=req.model,
        messages=[{"role": "user", "content": req.message}],
    )
    return ChatResponse(
        reply=response.choices[0].message.content,
        model_used=req.model,
        tokens_used=response.usage.total_tokens,
    )
```

That's all it takes. FastAPI runs async routes inside its event loop — the server can now handle hundreds of concurrent `/chat` requests.

<div class="callout info">
<strong>FastAPI's rule:</strong> If your route calls any async code (an async client, an async DB query, etc.), the route must be <code>async def</code>. If it does only synchronous work, leave it as <code>def</code> — FastAPI will run it in a thread pool to avoid blocking the event loop. Never mix: don't call blocking synchronous I/O inside an <code>async def</code> route.
</div>

## `asyncio.gather` — running tasks in parallel {#gather}

In Lesson 11 you saw that parallelizing LLM calls cuts processing time dramatically. `asyncio.gather()` is how you do that inside an async function. It runs multiple coroutines concurrently and waits for all of them to finish:

```python
import asyncio

async def summarize_one(text: str, client: AsyncOpenAI) -> str:
    response = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": f"Summarize in 2 sentences:\n{text}"}],
    )
    return response.choices[0].message.content

async def summarize_many(texts: list[str], client: AsyncOpenAI) -> list[str]:
    tasks = [summarize_one(text, client) for text in texts]
    summaries = await asyncio.gather(*tasks)
    return list(summaries)
```

If each `summarize_one` call takes 3 seconds, processing 10 documents synchronously takes 30 seconds. With `asyncio.gather`, all 10 run concurrently and finish in ~3 seconds.

### Handling errors in gather

By default, if one coroutine in `gather()` raises an exception, the whole gather fails. Use `return_exceptions=True` to collect results and exceptions together instead of failing fast:

```python
results = await asyncio.gather(*tasks, return_exceptions=True)

for i, result in enumerate(results):
    if isinstance(result, Exception):
        print(f"Task {i} failed: {result}")
    else:
        print(f"Task {i} succeeded: {result[:80]}")
```

This is the right default for batch processing in AI backends — one failed document should not abort the entire batch.

## When NOT to use async {#when-not-async}

Async is for **I/O-bound work** — waiting for network calls, disk reads, database queries. It does not help for **CPU-bound work** — heavy computation, image processing, tokenization at scale. For CPU-bound work, use multiprocessing or a background worker (covered in Lesson 24).

Also watch out for blocking calls inside async functions. These are the common traps:

| Do NOT use in async def | Use instead |
|---|---|
| `requests.get()` | `await httpx.AsyncClient().get()` |
| `time.sleep(n)` | `await asyncio.sleep(n)` |
| `open(path).read()` for large files | `aiofiles.open(path)` or offload to thread |
| Synchronous DB drivers (psycopg2) | Async drivers (asyncpg, SQLAlchemy async) |
| `OpenAI()` sync client methods | `AsyncOpenAI()` methods with `await` |

If you must call a blocking function from async code, use `asyncio.run_in_executor()` to offload it to a thread pool, so the event loop isn't blocked:

```python
import asyncio

def slow_cpu_operation(data: str) -> str:
    # Some slow, synchronous, CPU-heavy computation
    ...

async def safe_call_from_async(data: str) -> str:
    loop = asyncio.get_event_loop()
    # run_in_executor moves the blocking call to a thread pool
    result = await loop.run_in_executor(None, slow_cpu_operation, data)
    return result
```

## A fully async AI backend {#full-async-api}

Putting it together — an async FastAPI application with a batch summarize endpoint:

```python
import os
import asyncio
from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()
app = FastAPI(title="Async AI API")

class BatchSummarizeRequest(BaseModel):
    texts: list[str] = Field(..., min_length=1, max_length=20)
    max_words: int   = Field(100, ge=20, le=300)

class BatchSummarizeResponse(BaseModel):
    summaries: list[str]
    total_texts: int

def get_client() -> AsyncOpenAI:
    return AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def summarize_one(text: str, max_words: int, client: AsyncOpenAI) -> str:
    try:
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "user",
                "content": f"Summarize in at most {max_words} words:\n\n{text}"
            }],
        )
        return resp.choices[0].message.content
    except Exception as e:
        return f"[Error: {e}]"

@app.post("/summarize/batch", response_model=BatchSummarizeResponse)
async def batch_summarize(
    req: BatchSummarizeRequest,
    client: AsyncOpenAI = Depends(get_client),
):
    tasks = [summarize_one(text, req.max_words, client) for text in req.texts]
    summaries = await asyncio.gather(*tasks, return_exceptions=False)
    return BatchSummarizeResponse(
        summaries=list(summaries),
        total_texts=len(req.texts),
    )
```

This endpoint accepts up to 20 documents and summarizes all of them concurrently. Without async, a 20-document batch at 3s per document would take 60 seconds. With async, it takes ~3 seconds.
