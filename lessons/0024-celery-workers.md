---
layout: lesson
lesson_id: "0024"
chapter: 3
chapter_title: "Production AI Backends"
title: "Background workers with Celery"
description: "35–45 min read · Hands-on coding"
prev: "P008-docker-postgres.html"
prev_title: "Containerize your API with Docker and PostgreSQL"
next: "0025-mcp-servers.html"
next_title: "MCP servers — extending AI applications"
prereqs:
  - "[Project 8](P008-docker-postgres.html): The Dockerised API with Postgres — Celery jobs will store results there"
  - "[Lesson 21](0021-docker-for-ai.html): Docker Compose — Celery and Redis run as additional services"
assignment:
  article:
    title: "Asynchronous Tasks with FastAPI and Celery"
    url: "https://testdriven.io/blog/fastapi-and-celery/"
    author: "TestDriven.io"
    time: "15 min"
    why: "TestDriven.io is the most practical source for Python backend patterns. This specific article shows the exact project structure and task flow for FastAPI + Celery — including the polling pattern — which is the architecture you're implementing in P009."
  task:
    description: "Add a background document processing endpoint."
    steps:
      - "Add a `Job` table to your database with columns: `id` (UUID string, primary key), `status` (string: queued/processing/complete/failed), `result` (JSON text, nullable), `created_at` (timestamp). Generate an Alembic migration for it."
      - "Create `tasks.py` with the Celery app and a `process_document` task that: extracts 3 key points (LLM), generates a one-sentence summary (LLM), then updates the job record in Postgres with `status=\"complete\"` and the results as JSON"
      - "Add `POST /jobs` (accepts document text, queues task, returns job ID with 202) and `GET /jobs/{id}` (returns current status and result)"
      - "Add the worker service to `docker-compose.yml` and Flower on port 5555"
      - "Test end-to-end: submit a document via `POST /jobs`, observe the task in Flower, poll `GET /jobs/{id}` until status is \"complete\""
    expected: "A job that starts queued, becomes processing (visible in Flower), and reaches complete with the extracted points and summary stored in the database."
    why: "Background job queues appear in almost every AI engineering architecture. The specific implementation here — submit → poll → retrieve — is what you'll see in document ingestion pipelines, batch eval systems, and any AI feature where the processing time exceeds what an HTTP timeout allows."
knowledge_check:
  - q: "What are the three components of Celery and what does each one do?"
    a: "1. **Broker** — a message queue (usually Redis) that holds pending tasks between the FastAPI process and the worker. 2. **Worker** — a separate Python process that watches the broker, picks up tasks, and executes them. 3. **Result backend** — storage (Redis or a database) where completed task results are persisted so the caller can retrieve them."
    section: "#how-celery-works"
    section_title: "How Celery works"
  - q: "Why does a long-running AI job return HTTP 202 instead of 200?"
    a: "202 Accepted means \"the request was received and queued, but the work is not yet finished.\" 200 OK means \"the request was completed successfully.\" Returning 200 for a queued job would mislead the client into thinking the work is done when it isn't."
    section: "#fastapi-integration"
    section_title: "Wiring Celery into FastAPI"
  - q: "Why can't Celery task functions use `async def` and `await` directly?"
    a: "Celery workers run synchronous Python — they do not run inside an asyncio event loop. Using `await` outside an event loop raises a RuntimeError. If you need to call async code from a Celery task, you must create an event loop manually with `asyncio.run(your_async_function())`, which runs the async function synchronously from the worker's perspective."
    section: "#defining-tasks"
    section_title: "Defining and calling tasks"
  - q: "When should you use Celery instead of asyncio.gather for an AI task?"
    a: "Use Celery when: (1) the task takes longer than a reasonable HTTP timeout (30+ seconds); (2) the task must survive a server restart (Celery persists jobs in Redis); (3) you need to scale workers independently of the API; or (4) you need scheduled recurring jobs. For tasks under 30 seconds where the result is needed in the same HTTP response, `asyncio.gather` in an async route is simpler and sufficient."
    section: "#when-to-use"
    section_title: "When to use Celery vs async FastAPI"
additional_resources:
  - title: "Celery documentation"
    url: "https://docs.celeryq.dev/en/stable/"
    desc: "The official reference; especially the \"First Steps with Celery\" section"
  - title: "Celery task documentation"
    url: "https://docs.celeryq.dev/en/stable/userguide/tasks.html"
    desc: "All task options including retries, timeouts, and priorities"
  - title: "Flower documentation"
    url: "https://flower.readthedocs.io/en/latest/"
    desc: "Monitoring dashboard for Celery"
---

## Motivation

Async Python handles concurrent I/O-bound work well. But some AI tasks are simply too long for an HTTP response: processing a 500-page PDF might take 3 minutes; running an agent that makes 20 tool calls might take 5. Keeping an HTTP connection open for 5 minutes is fragile — mobile networks drop connections, browser tabs time out, load balancers kill long requests.

The solution is to decouple the **request** (accept the job) from the **processing** (do the work). The API immediately returns a job ID. A background worker picks up the job from a queue and processes it. The client polls a status endpoint or receives a webhook when the work is done. This is the standard pattern for every AI system that does heavy processing — document ingestion pipelines, batch evaluations, multi-step research agents. Celery is the most widely used Python implementation.

{% include prereqs.html %}

## How Celery works

Celery has three components:

1. **The message broker** — a queue that holds pending tasks. Redis is the standard choice for AI backends (you already have it in your Compose stack from Project 8). When your FastAPI route calls `some_task.delay()`, it pushes a message onto the Redis queue.

2. **The worker process** — a separate Python process that watches the queue, picks up tasks, and executes them. The worker runs your task functions. It is completely separate from the FastAPI server process.

3. **The result backend** — where task results are stored so the caller can retrieve them later. Redis can serve as the result backend too, or you can store results in your Postgres database.

The flow for a long AI job:

```
POST /process-document   → FastAPI saves the job to DB, calls task.delay()
                         → Returns {"job_id": "abc-123", "status": "queued"}

(Meanwhile, the Celery worker picks up the job from Redis...)

GET /jobs/abc-123       → Returns {"status": "processing", "progress": 40}
GET /jobs/abc-123       → Returns {"status": "complete", "result": {...}}
```

## Setting up Celery

```bash
uv add celery[redis]
```

Create a `tasks.py` file. This is where you define your Celery application and your task functions:

```python
import os
from celery import Celery
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

# Create the Celery app
celery_app = Celery(
    "ai_tasks",
    broker=REDIS_URL,          # where tasks are queued
    backend=REDIS_URL,         # where results are stored
    include=["tasks"],         # Python modules containing task definitions
)

celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    result_expires=3600,       # results expire after 1 hour
)
```

Add the worker and Redis to your Compose file:

```yaml
services:
  # ... api and db services from P008 ...

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  worker:
    build: .
    command: celery -A tasks.celery_app worker --loglevel=info --concurrency=4
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - redis
      - db
```

The worker runs the same Docker image as the API — it shares your codebase. The only difference is the command: instead of `uvicorn`, it runs the Celery worker process.

## Defining and calling tasks

A Celery task is a regular Python function decorated with `@celery_app.task`. Here is a document processing task that a user might submit via API:

```python
import json
from openai import OpenAI   # Note: Celery tasks use sync OpenAI — no async in Celery workers
from tasks import celery_app

@celery_app.task(bind=True, max_retries=3)
def process_document(self, document_text: str, job_id: str):
    """
    Extract entities, classify, and summarize a document.
    Runs in the Celery worker — not the FastAPI process.
    """
    client = OpenAI()

    try:
        # Step 1: Extract entities
        entity_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "user",
                "content": f"Extract key entities (people, places, dates) from:\n\n{document_text[:4000]}"
            }],
        )
        entities = entity_response.choices[0].message.content

        # Step 2: Classify
        classify_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "user",
                "content": (
                    f"Classify this document as one of: legal, financial, technical, general.\n\n"
                    f"Respond with just the label.\n\n{document_text[:2000]}"
                )
            }],
        )
        category = classify_response.choices[0].message.content.strip()

        # Step 3: Summarize
        summary_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "user",
                "content": f"Summarize in 3 sentences:\n\n{document_text[:6000]}"
            }],
        )
        summary = summary_response.choices[0].message.content

        return {
            "job_id": job_id,
            "status": "complete",
            "entities": entities,
            "category": category,
            "summary": summary,
        }

    except Exception as exc:
        # Retry with exponential backoff on failure
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
```

<div class="callout info">
<strong>Sync, not async in Celery workers:</strong> Celery workers run synchronous Python, not async. Use the regular <code>OpenAI()</code> client, not <code>AsyncOpenAI()</code>. If you need to call async code from a Celery task, use <code>asyncio.run()</code> to create a fresh event loop.
</div>

## Wiring Celery into FastAPI

The FastAPI route accepts the job, saves a record to the database, and queues the Celery task. It returns immediately with a job ID — the client does not wait for the processing to finish:

```python
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db, Job
from tasks import process_document

router = APIRouter(prefix="/jobs", tags=["jobs"])

class SubmitJobRequest(BaseModel):
    document_text: str = Field(..., min_length=100, max_length=100_000)

class JobStatusResponse(BaseModel):
    job_id: str
    status: str            # queued, processing, complete, failed
    result: dict | None

@router.post("/", response_model=JobStatusResponse, status_code=202)
async def submit_job(
    req: SubmitJobRequest,
    db: AsyncSession = Depends(get_db),
):
    import uuid
    job_id = str(uuid.uuid4())

    # Save job record to database
    job = Job(id=job_id, status="queued", document_text=req.document_text)
    db.add(job)
    await db.commit()

    # Queue the Celery task — returns immediately
    process_document.delay(req.document_text, job_id)

    return JobStatusResponse(job_id=job_id, status="queued", result=None)

@router.get("/{job_id}", response_model=JobStatusResponse)
async def get_job(job_id: str, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    result = await db.execute(select(Job).where(Job.id == job_id))
    job = result.scalar_one_or_none()
    if job is None:
        raise HTTPException(404, "Job not found")
    return JobStatusResponse(job_id=job.id, status=job.status, result=job.result)
```

HTTP status `202 Accepted` (instead of 200) signals to the caller that the request was accepted but the work is not yet complete. This is the correct semantic for asynchronous jobs.

## Retries and error handling

LLM API calls fail transiently — rate limits, timeouts, temporary outages. Celery's retry mechanism handles this cleanly:

```python
@celery_app.task(bind=True, max_retries=3)
def process_document(self, document_text: str, job_id: str):
    try:
        # ... do the work ...
    except openai.RateLimitError as exc:
        # Retry after exponential backoff: 2^0=1s, 2^1=2s, 2^2=4s
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
    except openai.APIError as exc:
        raise self.retry(exc=exc, countdown=5)
    except Exception as exc:
        # Non-retryable error — update the job record and give up
        update_job_status(job_id, "failed", error=str(exc))
        raise   # Re-raise so Celery marks the task as FAILURE
```

`bind=True` gives the task function access to `self`, which has `self.request.retries` (how many times it has retried so far) and `self.retry()` (re-queue with a delay).

## Monitoring with Flower

**Flower** is a web dashboard for Celery that shows active workers, task history, success/failure rates, and task details. Add it to Compose:

```yaml
  flower:
    image: mher/flower:latest
    command: celery --broker=redis://redis:6379/0 flower --port=5555
    ports:
      - "5555:5555"
    depends_on:
      - redis
```

Open `http://localhost:5555` to see the dashboard. During development, Flower is invaluable for confirming that tasks are being queued and processed, and for inspecting failures.

## When to use Celery vs async FastAPI

| Scenario | Use |
|----------|-----|
| Single LLM call, < 5 seconds | Async FastAPI route |
| Parallel LLM calls, < 30 seconds | asyncio.gather in async route |
| Long multi-step AI pipeline (> 30 seconds) | Celery task |
| Batch processing (100 documents) | Celery with multiple workers |
| Scheduled recurring jobs (nightly report) | Celery Beat (scheduler) |
| Task must survive server restart | Celery (persisted in Redis) |
| Task result needed in the same HTTP response | Async FastAPI route |
