---
layout: project
lesson_id: "P007"
chapter: 3
chapter_title: "Production AI Backends"
project_type: "Project"
title: "Build an AI-powered REST API"
description: "Estimated time: 2–3 hours · Portfolio-worthy"
prev: "0020-async-python.html"
prev_title: "Async Python"
next: "0021-docker-for-ai.html"
next_title: "Docker for AI applications"
prereqs:
  - "[Lesson 18](0018-fastapi-basics.html): FastAPI routes, Pydantic request/response models, dependency injection"
  - "[Lesson 19](0019-pydantic-validation.html): Field constraints, validators, LLM output parsing"
  - "[Lesson 20](0020-async-python.html): async/await, AsyncOpenAI, asyncio.gather"
---

## Overview

You have three lessons of theory — routes, Pydantic validation, and async. Now you build the real thing: a production-shaped FastAPI backend that exposes AI capabilities as a clean HTTP API.

This is the foundation of every project in Chapter 3. You will extend it with Docker, PostgreSQL, and Celery in the lessons ahead. Start clean.

{% include prereqs.html %}

## Specification {#spec}

Build a FastAPI application with the following endpoints:

### Required endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/health` | Returns `{"status": "ok", "version": "1.0.0"}` |
| POST | `/chat` | Single-turn chat with an LLM |
| POST | `/chat/batch` | Process up to 10 messages concurrently |
| POST | `/summarize` | Summarize text with configurable length |
| POST | `/classify` | Classify text into caller-provided categories |

### /chat request and response

```json
// Request
{
  "message": "What is the capital of France?",
  "model": "gpt-4o-mini",        // optional, default: gpt-4o-mini
  "temperature": 0.7             // optional, default: 0.7, range: 0.0–2.0
}

// Response
{
  "reply": "The capital of France is Paris.",
  "model_used": "gpt-4o-mini",
  "tokens_used": 42
}
```

### /chat/batch request and response

```json
// Request
{
  "messages": ["What is 2+2?", "Name a planet.", "Who wrote Hamlet?"],
  "model": "gpt-4o-mini"         // optional
}

// Response
{
  "replies": ["4", "Mars", "William Shakespeare"],
  "total_messages": 3,
  "failed": 0
}
```

### /summarize request and response

```json
// Request
{
  "text": "Long document text here...",
  "max_words": 150,              // optional, default: 150, range: 50–500
  "focus_on": "key findings"    // optional hint to guide the summary
}

// Response
{
  "summary": "The document describes...",
  "original_word_count": 843,
  "summary_word_count": 147
}
```

### /classify request and response

```json
// Request
{
  "text": "My server has been returning 500 errors since the last deploy.",
  "labels": ["billing", "technical support", "feature request", "feedback"],
  "include_reasoning": true      // optional, default: false
}

// Response
{
  "label": "technical support",
  "confidence": "high",
  "reasoning": "The text describes a server error following a deployment."
  // reasoning field omitted when include_reasoning is false
}
```

## Technical requirements {#requirements}

- **Pydantic models** for every request and response with appropriate constraints (`Field()` with min/max lengths, numeric ranges)
- **Async routes** throughout — use `AsyncOpenAI` and `await`
- **Dependency injection** for the OpenAI client (`Depends(get_client)`)
- **Error handling** — catch `openai.RateLimitError`, `openai.APIError`, `json.JSONDecodeError`, and `ValidationError` separately, each returning an appropriate HTTP status code
- **Structured LLM output** on `/classify` — use JSON mode and parse with Pydantic; handle parse failures gracefully
- **Parallel processing** on `/chat/batch` — use `asyncio.gather(return_exceptions=True)`
- **Project structure** — split into `main.py`, `routers/`, `models/`, `dependencies.py`
- **Environment variables** — API key from `.env` via `python-dotenv`, never hardcoded

## Completion checklist

- [ ] `GET /health` returns 200 with version string
- [ ] `POST /chat` returns a valid `ChatResponse` with tokens counted
- [ ] `POST /chat/batch` processes all messages concurrently; partial failures return error strings rather than aborting
- [ ] `POST /summarize` respects `max_words` and includes word counts
- [ ] `POST /classify` uses JSON mode and returns a validated label from the caller's list
- [ ] All models have `Field()` constraints — verified in `/docs`
- [ ] `/docs` shows all 5 endpoints with correct schemas and descriptions
- [ ] Sending an invalid request (e.g. missing `message`) returns 422, not 500
- [ ] Sending a label not in the `labels` list returns a 422 error, not an LLM hallucination
- [ ] Code is split across `routers/`, `models/`, and `dependencies.py` — no monolithic `main.py`

## Testing your API {#testing}

Use the `/docs` UI for manual testing. For scripted tests, use curl:

```bash
# Test /chat
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is the speed of light?"}'

# Test /chat/batch
curl -X POST http://localhost:8000/chat/batch \
  -H "Content-Type: application/json" \
  -d '{"messages": ["Hello", "What year is it?", "Name a colour"]}'

# Test /classify
curl -X POST http://localhost:8000/classify \
  -H "Content-Type: application/json" \
  -d '{"text": "I cant log in", "labels": ["billing", "access", "feature request"]}'

# Test validation (should return 422)
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"temperature": 99}'
```

## Extension challenges

1. **Streaming chat:** Add a `POST /chat/stream` endpoint that streams the LLM response token-by-token using FastAPI's `StreamingResponse` and the OpenAI streaming API. The response should be a Server-Sent Events stream.

2. **API key authentication:** Add a bearer token authentication dependency (use an environment variable `API_SECRET_KEY`). All endpoints except `/health` should require the correct token.

3. **Request logging middleware:** Add FastAPI middleware that logs every request (method, path, status code, duration in ms) to stdout. This is the foundation of the observability you will build in Chapter 5.

4. **Multi-provider support:** Add an `Anthropic` provider option to `/chat`. When the caller sets `"provider": "anthropic"`, use the Anthropic SDK instead of OpenAI. Use a dependency that returns either client based on the request.
