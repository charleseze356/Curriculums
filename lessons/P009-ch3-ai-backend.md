---
layout: project
lesson_id: "P009"
chapter: 3
chapter_title: "Production AI Backends"
project_type: "Chapter Project"
title: "Full AI Backend Service"
description: "Estimated time: 6–10 hours · Portfolio-grade · Deployable"
prev: "0025-mcp-servers.html"
prev_title: "MCP servers — extending AI applications"
next: null
prereqs:
  - "[Lesson 18](0018-fastapi-basics.html): FastAPI REST API — you'll build the main service"
  - "[Lesson 19](0019-error-handling.html): Pydantic and error handling — all request/response models"
  - "[Lesson 20](0020-async-fastapi.html): Async FastAPI — everything is async"
  - "[Lesson 21](0021-docker-for-ai.html): Docker Compose — the deployment layer"
  - "[Lesson 22](0022-postgres-sqlalchemy.html): PostgreSQL and SQLAlchemy — persistent data"
  - "[Lesson 23](0023-alembic-migrations.html): Alembic migrations — schema management"
  - "[Lesson 24](0024-celery-workers.html): Celery workers — background jobs"
  - "[Lesson 25](0025-mcp-servers.html): MCP servers — AI client integration"
---

## Overview

This is the Chapter 3 capstone. It integrates every pattern from the chapter into a production-shaped service that you can deploy, demonstrate, and discuss in interviews. The system accepts document uploads, processes them asynchronously, persists results, and exposes a clean API — the architecture that backs real document intelligence products.

The system implements:

- **FastAPI REST API** with proper Pydantic models and error handling (Lessons 18–19)
- **Async throughout** — all routes, all LLM calls, all DB queries (Lesson 20)
- **Docker Compose** — four services, single command to start (Lesson 21)
- **PostgreSQL with SQLAlchemy** — conversation and job persistence (Lesson 22)
- **Alembic migrations** — all schema changes are versioned (Lesson 23)
- **Celery background workers** — long AI tasks dequeued and processed (Lesson 24)
- **MCP server** — exposes the system's capabilities to AI clients (Lesson 25)

<div class="callout info">
<strong>Portfolio note:</strong> A deployed, running instance of this project — with an API you can curl, a Flower dashboard showing workers, and an MCP server you can connect to from Claude — is a strong interview artifact. Take time to polish the README and make it publicly accessible on GitHub.
</div>

## System design

### User-facing flows

The system supports two distinct usage patterns:

1. **Synchronous chat** — the user sends a message, the LLM replies in real time. Backed by conversation history in PostgreSQL.

2. **Asynchronous document processing** — the user submits a document, receives a job ID immediately, and polls for results. The Celery worker processes the document (extract, classify, summarize) and stores results.

### Architecture diagram

```
Client
  │
  ▼
FastAPI (port 8000)        ─── PostgreSQL (port 5432)
  │                              ├── conversations table
  ├── /conversations/*           ├── messages table
  ├── /jobs/*                    ├── jobs table
  ├── /chat                      └── documents table
  └── /health
  │
  ▼
Redis (port 6379)  ◄──── Celery Worker
                              ├── process_document task
                              └── batch_classify task

MCP Server (stdio / port 8001)
  ├── tool: summarize_text
  ├── tool: classify_text
  ├── tool: get_job_status
  └── resource: api://jobs/recent
```

### Docker Compose services

| Service | Image | Exposed port |
|---------|-------|--------------|
| `api` | Your Dockerfile | 8000 |
| `db` | postgres:16-alpine | 5432 |
| `redis` | redis:7-alpine | 6379 |
| `worker` | Your Dockerfile (different command) | — |
| `flower` | mher/flower | 5555 |

## API specification

### Conversations

| Method | Path | Description |
|--------|------|-------------|
| POST | `/conversations` | Create a conversation |
| GET | `/conversations` | List conversations (recent first) |
| GET | `/conversations/{id}` | Get conversation with messages |
| POST | `/conversations/{id}/messages` | Send message, receive LLM reply |
| DELETE | `/conversations/{id}` | Delete conversation + messages |

### Document processing jobs

| Method | Path | Description |
|--------|------|-------------|
| POST | `/jobs` | Submit a document for processing (returns 202 + job ID) |
| GET | `/jobs/{id}` | Get job status and result |
| GET | `/jobs` | List recent jobs (last 20) |
| DELETE | `/jobs/{id}` | Cancel a queued job (or delete a completed one) |

### Utility

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Returns service status, DB connectivity, worker count |
| POST | `/chat` | Stateless single-turn chat (from P007) |
| POST | `/chat/batch` | Concurrent batch chat (from P007) |

## Celery task specification

### `process_document`

Triggered by `POST /jobs`. Runs three sequential LLM calls:

1. **Extract key points** — 5 bullet-point key findings from the document
2. **Classify** — assigns one of: legal, financial, technical, medical, general
3. **Summarize** — a 3-sentence executive summary

Stores all three results in the `jobs` table as JSON. Updates status from `queued` → `processing` → `complete` (or `failed`). Retries on OpenAI errors up to 3 times with exponential backoff.

### `batch_classify`

Accepts a list of texts and labels. Classifies all in parallel using Python `ThreadPoolExecutor` (sync OpenAI client, multi-threaded). Returns a list of `{text_index, label, confidence}` objects.

<div class="callout info">
<strong>ThreadPoolExecutor in Celery:</strong> Celery workers are synchronous, so you can't use <code>asyncio.gather</code>. For parallelism inside a task, use <code>concurrent.futures.ThreadPoolExecutor</code> — each thread makes its own synchronous OpenAI call.
</div>

## Database schema

All tables must be managed via Alembic. Your migrations directory should have:

1. **Migration 1:** Create `conversations` and `messages` tables
2. **Migration 2:** Create `jobs` table with columns: `id` (UUID), `status`, `document_text`, `result_json` (TEXT, nullable), `error_message` (TEXT, nullable), `created_at`, `completed_at` (nullable)
3. **Migration 3:** Add `cost_usd` (FLOAT, nullable) to `messages`

## MCP server specification

Build an MCP server (`mcp_server.py`) that exposes the system to AI clients:

| Name | Type | Description |
|------|------|-------------|
| `summarize_text` | Tool | Summarizes text using the AI backend |
| `classify_document` | Tool | Classifies text into legal/financial/technical/medical/general |
| `submit_document_job` | Tool | Submits a document to the processing queue and returns a job ID |
| `get_job_status` | Tool | Returns current status and result (if complete) for a job ID |
| `api://jobs/recent` | Resource | JSON list of the 10 most recent jobs with their statuses |

The MCP tools that call the API should use `httpx` to call your FastAPI server (which is running on `localhost:8000` or the container's hostname).

## Completion checklist

- [ ] `docker compose up -d` starts all 5 services with no errors
- [ ] `GET /health` returns 200 with DB connectivity confirmed
- [ ] `alembic history` shows 3 migrations; `alembic current` shows head
- [ ] Full conversation flow: create → 3 messages → get (verifies context memory) → delete
- [ ] Job flow: POST /jobs → 202 response → GET /jobs/{id} shows "queued" → poll until "complete" → result has key_points, category, summary
- [ ] Job failure: submit a job with empty text → job reaches "failed" with a meaningful error message
- [ ] Flower dashboard at http://localhost:5555 shows the worker and processed tasks
- [ ] `docker compose down` → `docker compose up -d` → all conversations and jobs are still in the database
- [ ] MCP server's `submit_document_job` tool submits a job; `get_job_status` returns the result
- [ ] All Pydantic models have constraints — `/docs` shows them
- [ ] No secrets in the codebase — API key comes from environment variable only
- [ ] `.env` is in both `.dockerignore` and `.gitignore`
- [ ] A `README.md` explains how to run the project (1 page max — just the commands needed)

## Suggested project structure

```
ai-backend/
├── Dockerfile
├── docker-compose.yml
├── entrypoint.sh
├── .env                     # not committed
├── .dockerignore
├── .gitignore
├── alembic.ini
├── alembic/
│   ├── env.py
│   └── versions/
│       ├── 001_create_conversations_messages.py
│       ├── 002_create_jobs.py
│       └── 003_add_cost_usd_to_messages.py
├── main.py                  # FastAPI app, includes routers
├── database.py              # SQLAlchemy models + engine + get_db
├── tasks.py                 # Celery app + task definitions
├── mcp_server.py            # MCP server
├── dependencies.py          # get_client(), require_api_key()
├── routers/
│   ├── conversations.py
│   ├── jobs.py
│   ├── chat.py
│   └── health.py
└── models/
    ├── requests.py
    └── responses.py
```

## Extension challenges

1. **Streaming chat endpoint:** Add `POST /chat/stream` that uses FastAPI's `StreamingResponse` and the OpenAI streaming API to send tokens as they are generated. Use Server-Sent Events format.

2. **API key authentication:** Add bearer token authentication to all endpoints except `/health`. Store valid API keys in Postgres and verify via a dependency.

3. **Job priority:** Add a `priority` field to job submission (low/normal/high). Use Celery's task priority feature to process high-priority jobs before low-priority ones.

4. **Webhook notifications:** Add an optional `callback_url` to job submission. When a job completes, the Celery task makes an HTTP POST to the callback URL with the result. This removes the need for the client to poll.

5. **Deploy it:** Push to a GitHub repo, set up a Hetzner CX21 VM (€3.29/month), install Docker, and run `docker compose up -d` on the VM. This is the Chapter 6 deployment you will do properly — doing it now for practice is valuable.
