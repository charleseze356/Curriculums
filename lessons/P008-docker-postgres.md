---
layout: project
lesson_id: "P008"
chapter: 3
chapter_title: "Production AI Backends"
project_type: "Project"
title: "Containerize your API with Docker and PostgreSQL"
description: "Estimated time: 2–4 hours · Foundation for Chapter Project"
prev: "0023-alembic-migrations.html"
prev_title: "Database migrations with Alembic"
next: "0024-celery-workers.html"
next_title: "Background workers with Celery"
prereqs:
  - "[Project 7](P007-rest-api-backend.html): The REST API backend with conversations"
  - "[Lesson 21](0021-docker-for-ai.html): Docker Compose — you'll manage multiple services"
  - "[Lesson 23](0023-alembic-migrations.html): Alembic migrations — the schema management tool"
---

## Overview

This project upgrades the Project 7 REST API into a fully containerised application backed by PostgreSQL and managed with Alembic migrations. When you finish, your AI backend will run via a single `docker compose up` command and persist conversation history across restarts.

This is the stack that Chapter 3's final project (P009) and every subsequent chapter project build on. Getting it solid here means the rest of the chapter is clean.

## Specification

### Architecture

Your Compose stack must include exactly three services:

| Service | Image | Purpose |
|---------|-------|---------|
| `api` | Built from your Dockerfile | FastAPI AI backend |
| `db` | `postgres:16-alpine` | PostgreSQL database |
| `redis` | `redis:7-alpine` | Redis cache (used in P009 for Celery) |

Include Redis now even though Celery isn't added until Lesson 24. Getting the service wired up now means the P009 upgrade is smaller.

### Required functionality

All endpoints from Project 7 must continue to work. Add these conversation endpoints:

| Method | Path | Description |
|--------|------|-------------|
| POST | `/conversations` | Create a new conversation |
| GET | `/conversations` | List conversations (most recent first, limit 20) |
| GET | `/conversations/{id}` | Get a conversation with all its messages |
| POST | `/conversations/{id}/messages` | Send a message; LLM replies using full conversation history |
| DELETE | `/conversations/{id}` | Delete a conversation and all its messages |

### Database schema

Implement the `conversations` and `messages` tables from Lesson 22, plus the `cost_usd` column from Lesson 23. Both tables must be created via Alembic migrations — not `create_all`.

## Technical requirements

- **Docker Compose**: all three services defined in `docker-compose.yml`
- **Health check**: `db` service has a PostgreSQL health check; `api` depends on `db` with `condition: service_healthy`
- **Named volume**: `postgres_data` volume so database survives `docker compose down` (not `docker compose down -v`)
- **Entrypoint script**: runs `alembic upgrade head` before starting uvicorn
- **Environment variables**: `OPENAI_API_KEY` and `DATABASE_URL` read from `.env` file via Compose `env_file`
- **Async everything**: SQLAlchemy async session, AsyncOpenAI client, async routes
- **Conversation history**: `POST /conversations/{id}/messages` passes the full message history to the LLM, not just the latest message
- **Cascade delete**: deleting a conversation deletes all its messages (enforced at the database level with `ON DELETE CASCADE`)

## Completion checklist

- [ ] `docker compose up -d` starts all three services with no errors
- [ ] `GET /health` returns 200 after containers start
- [ ] `alembic current` shows head revision on first startup
- [ ] `POST /conversations` → `POST /conversations/{id}/messages` x3 → `GET /conversations/{id}` returns all 4 messages (3 user, 3 assistant)
- [ ] The LLM's third reply demonstrates memory of the first message (proves history is passed)
- [ ] `docker compose down` then `docker compose up -d` — conversations from before the restart are still accessible
- [ ] `DELETE /conversations/{id}` returns 204 and subsequent `GET` returns 404
- [ ] `.env` is in `.dockerignore` and `.gitignore`
- [ ] All original P007 endpoints still work (`/chat`, `/summarize`, `/classify`, `/chat/batch`)

## Implementation hints

### env_file in Compose

```yaml
services:
  api:
    build: .
    env_file:
      - .env          # reads OPENAI_API_KEY, DATABASE_URL etc from .env
    environment:
      - DATABASE_URL=postgresql+asyncpg://postgres:password@db:5432/aidb
      # Note: env_file values + environment values are merged
      # environment block takes precedence for the same key
```

### Two DATABASE_URL values

Your app uses the asyncpg URL (`postgresql+asyncpg://...`).
Alembic needs a sync URL (`postgresql+psycopg2://...`).
Use a second env var:

```
# .env
DATABASE_URL=postgresql+asyncpg://postgres:password@db:5432/aidb
ALEMBIC_DATABASE_URL=postgresql+psycopg2://postgres:password@db:5432/aidb
```

In `alembic/env.py`, read `ALEMBIC_DATABASE_URL`.

### Waiting for Postgres inside the entrypoint

Even with `condition: service_healthy`, the application container may start before Postgres accepts connections (the health check only runs every 5s). A simple wait loop in the entrypoint is safer:

```bash
#!/bin/bash
set -e

echo "Waiting for database..."
until alembic current > /dev/null 2>&1; do
  sleep 1
done

echo "Running migrations..."
alembic upgrade head

echo "Starting server..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
```

## Extension challenges

1. **Conversation title auto-generation:** When the first message in a conversation is sent, make a second LLM call to generate a short title (5 words or fewer) and update the conversation record. Return the title in the `POST /conversations/{id}/messages` response.

2. **Token budget enforcement:** Add a `max_context_tokens` field to `Conversation`. When building the history for an LLM call, trim the oldest messages until the estimated token count is below the budget. (Estimate: 1 token ≈ 4 characters.)

3. **Cost tracking:** Populate `cost_usd` on every message using the token counts from the OpenAI response and the current model pricing. Add a `GET /conversations/{id}/cost` endpoint that returns total cost for the conversation.
