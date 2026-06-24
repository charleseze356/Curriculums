---
layout: lesson
lesson_id: "0021"
chapter: 3
chapter_title: "Production AI Backends"
title: "Docker for AI applications"
description: "35–45 min read · Hands-on"
prev: "P007-ai-rest-api.html"
prev_title: "Project: AI-powered REST API"
next: "0022-postgres-sqlalchemy.html"
next_title: "PostgreSQL and SQLAlchemy for AI backends"
prereqs:
  - "[Project 7](P007-ai-rest-api.html): A working FastAPI AI backend to containerise"
  - "Basic command-line comfort — you will run `docker` commands in your terminal"
  - "Docker Desktop installed — download from [docker.com](https://www.docker.com/products/docker-desktop/)"
assignment:
  article:
    title: "Docker Best Practices for Python Developers"
    url: "https://testdriven.io/blog/docker-best-practices/"
    author: "TestDriven.io"
    time: "about 15 minutes"
    why: "This practitioner guide covers the mistakes Python developers make with Docker — non-slim base images, baking secrets into layers, poor layer caching — and the fixes. Most of what it covers is directly applicable to your AI backend."
  task:
    description: "Containerise the Project 7 API."
    steps:
      - "Create a `Dockerfile` in your Project 7 directory using the pattern in this lesson. Verify the layer order is correct (dependencies before code)."
      - "Create a `.dockerignore` file that excludes `.env`, `__pycache__`, and `.git`"
      - "Build the image: `docker build -t ai-api .`"
      - "Run it with your API key passed via `-e`: confirm `GET http://localhost:8000/health` returns 200"
      - "Create a `docker-compose.yml` that runs your API and a Postgres container (you won't use Postgres yet — just confirm both containers start and the API is healthy)"
      - "Test: `docker compose up -d` → wait for health → `curl http://localhost:8000/health` → `docker compose down`"
    expected: "`docker compose up -d` starts both services; `http://localhost:8000/docs` loads; `docker compose down` stops cleanly."
    why: "Everything in Chapter 3 onwards runs in Docker. If this step is solid, the rest of the chapter is straightforward. If it is shaky, every subsequent project will have environment issues. Take the time to get this right."
knowledge_check:
  - q: "Why should you copy `pyproject.toml` and install dependencies *before* copying the rest of your application code?"
    a: "Docker caches each layer. When you rebuild, it only re-runs instructions from the first changed layer downwards. Dependencies change rarely; application code changes constantly. Copying dependencies first means a code change only invalidates the final `COPY . .` layer — the expensive dependency install layer stays cached."
    section: "#dockerfile"
    section_title: "Layer caching"
  - q: "How do containers in the same Docker Compose file communicate with each other?"
    a: "Docker Compose automatically puts all services on a shared network. Each service is reachable at a hostname equal to its service name in the YAML file. So if your database service is named `db`, your API container reaches it at hostname `db` on port 5432 — not `localhost`."
    section: "#docker-compose"
    section_title: "Service networking in Compose"
  - q: "Why should you never copy your `.env` file into a Docker image?"
    a: "Docker images are portable and may be pushed to registries (Docker Hub, GitHub Packages, AWS ECR) where others can pull them. A `.env` baked into the image exposes your API keys to anyone with image access. Always pass secrets at runtime via environment variables or a secrets manager."
    section: "#build-run"
    section_title: "Never bake secrets into images"
  - q: "What does `depends_on: condition: service_healthy` do in a Compose file?"
    a: "It tells Docker Compose to wait until the dependency service reports a healthy status (via its `healthcheck`) before starting the current service. Without it, the API container might start before Postgres finishes initialising, causing connection errors at startup."
    section: "#docker-compose"
    section_title: "Docker Compose"
additional_resources:
  - title: "Docker official Get Started guide"
    url: "https://docs.docker.com/get-started/"
    desc: "The definitive intro if you want to go deeper on images, volumes, and networks"
  - title: "Docker Compose file reference"
    url: "https://docs.docker.com/compose/compose-file/"
    desc: "Every option in the YAML format"
  - title: "Play With Docker"
    url: "https://labs.play-with-docker.com/"
    desc: "A free browser-based Docker sandbox; useful if Docker Desktop is slow on your machine"
---

## Motivation

Your FastAPI AI backend works on your machine. But "works on my machine" is not deployable. When you ship to a cloud server, a different engineer's laptop, or a CI pipeline, Python version mismatches, missing system libraries, and different environment variables will break things in ways that are hard to diagnose.

Docker solves this by packaging your application, its exact Python version, all its dependencies, and its configuration into a single portable unit called a **container**. Run the container anywhere — your laptop, a Linux VM in Hetzner, GitHub Actions — and the application behaves identically. Docker is the standard deployment unit for production AI backends, and fluency with it is expected in every AI engineering role.

{% include prereqs.html %}

## Containers vs virtual machines {#containers-vs-vms}

A **virtual machine** (VM) is a complete simulated computer — it has its own operating system, kernel, and hardware emulation. Starting a VM takes minutes; each VM uses gigabytes of RAM.

A **container** is much lighter. It shares the host machine's operating system kernel but runs in an isolated process with its own filesystem, network, and environment variables. Starting a container takes seconds; containers use only the memory your application actually needs.

For an AI backend, you typically run two or three containers (your API, a database, maybe a Redis cache) on a single VM. Each container is isolated — the database cannot accidentally see your API's environment variables — but they can communicate over a shared network that Docker creates.

## The Dockerfile {#dockerfile}

A **Dockerfile** is a text file that describes how to build a container image. It is a sequence of instructions that Docker executes in order: start from a base image, copy files, install dependencies, set configuration.

Here is a production-ready Dockerfile for the FastAPI backend from Project 7:

```dockerfile
# Use a specific Python version — never "latest" in production
FROM python:3.12-slim

# Prevent Python from writing .pyc files (containers don't need them)
ENV PYTHONDONTWRITEBYTECODE=1
# Ensure stdout/stderr is flushed immediately (important for log collection)
ENV PYTHONUNBUFFERED=1

# Set the working directory inside the container
WORKDIR /app

# Copy dependency definitions first (take advantage of layer caching)
COPY pyproject.toml uv.lock ./

# Install uv and use it to install dependencies
RUN pip install uv && uv sync --frozen --no-dev

# Copy the rest of the application code
COPY . .

# Document which port the application uses (informational — doesn't actually expose it)
EXPOSE 8000

# The command to run when the container starts
CMD ["uv", "run", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Layer caching: why the order matters

Every `RUN`, `COPY`, and `ADD` instruction creates a **layer** in the image. Docker caches each layer. When you rebuild, it only re-runs instructions where something changed — and everything after them.

This is why you copy `pyproject.toml` and install dependencies *before* copying your application code. Your dependencies rarely change; your code changes constantly. With this order, a code change only re-runs the last `COPY . .` step. Reversed, every code change would reinstall all dependencies — slow.

<div class="callout info">
<strong>The golden rule:</strong> Put the things that change least at the top of the Dockerfile. Put the things that change most (your code) at the bottom.
</div>

## Building and running a container {#build-run}

```bash
# Build the image, tag it "ai-api"
docker build -t ai-api .

# Run it, map port 8000 on your machine to port 8000 in the container
docker run -p 8000:8000 ai-api

# But the container has no .env file — pass env vars at runtime instead:
docker run -p 8000:8000 \
  -e OPENAI_API_KEY=sk-... \
  ai-api

# Run in the background (detached mode)
docker run -d -p 8000:8000 \
  -e OPENAI_API_KEY=sk-... \
  --name my-ai-api \
  ai-api

# See running containers
docker ps

# View logs from a running container
docker logs my-ai-api

# Stop it
docker stop my-ai-api
```

### Never bake secrets into images

Do NOT put your API key in the Dockerfile or copy your `.env` file into the image. Docker images can be pushed to registries (GitHub Packages, Docker Hub, AWS ECR) where others might see them. Always pass secrets at runtime via `-e VARNAME=value` or, in production, via a secrets manager.

Add a `.dockerignore` file alongside your Dockerfile to prevent sensitive files from being accidentally copied into the image:

```
.env
.env.*
__pycache__/
*.pyc
*.pyo
.git/
.gitignore
tests/
*.md
```

## Docker Compose — running multiple containers together {#docker-compose}

An AI backend rarely runs alone. It needs a database, maybe a cache, maybe a background worker. Running and connecting these individually with `docker run` becomes unwieldy. **Docker Compose** lets you define all your services in a single YAML file and start everything with one command.

Here is a `docker-compose.yml` for the AI backend plus a PostgreSQL database (which you will use in Lesson 22):

```yaml
services:
  api:
    build: .                   # build from the Dockerfile in the current directory
    ports:
      - "8000:8000"            # host:container port mapping
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}   # read from host .env file
      - DATABASE_URL=postgresql+asyncpg://postgres:password@db:5432/aidb
    depends_on:
      db:
        condition: service_healthy         # wait for postgres to be ready
    volumes:
      - .:/app                 # mount current directory for hot reload in dev
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload

  db:
    image: postgres:16-alpine              # official postgres image, slim variant
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: aidb
    ports:
      - "5432:5432"                        # expose for local tools (e.g. psql, pgAdmin)
    volumes:
      - postgres_data:/var/lib/postgresql/data   # persist data between restarts
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:               # named volume — survives container restarts
```

Start everything:

```bash
# Start all services in the background
docker compose up -d

# Watch logs from all services
docker compose logs -f

# Stop everything
docker compose down

# Stop and delete the database volume (fresh start)
docker compose down -v
```

### Service networking in Compose

Compose puts all services on a shared network automatically. The hostname of each service is its name in the YAML file. That is why the `DATABASE_URL` uses `db:5432` — the API container reaches the Postgres container at the hostname `db`.

From your laptop, you reach the API at `http://localhost:8000`. The database is accessible from your laptop at `localhost:5432` (because of the port mapping). Inside the containers, they reach each other by service name.

## Development vs production Compose files {#dev-vs-prod}

The volume mount (`- .:/app`) and `--reload` flag are development-only. In production you do not want live code reloading or the host filesystem mounted. A common pattern is separate files:

```
docker-compose.yml         # base config shared by both environments
docker-compose.dev.yml     # development overrides (volume mounts, reload)
docker-compose.prod.yml    # production overrides (no mounts, more replicas)
```

In development:
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

In production:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

For now, one file that works for development is fine. You will revisit this in Chapter 6 when you deploy to a real cloud server.

## Docker commands you will use daily {#useful-commands}

| Command | What it does |
|---|---|
| `docker build -t name .` | Build image from Dockerfile in current directory |
| `docker run -p 8000:8000 name` | Run a container, mapping ports |
| `docker ps` | List running containers |
| `docker ps -a` | List all containers (including stopped) |
| `docker logs <name>` | View container stdout/stderr |
| `docker exec -it <name> bash` | Open a shell inside a running container |
| `docker stop <name>` | Stop a running container |
| `docker rm <name>` | Delete a stopped container |
| `docker images` | List all local images |
| `docker rmi <name>` | Delete an image |
| `docker compose up -d` | Start all Compose services in background |
| `docker compose down` | Stop all Compose services |
| `docker compose logs -f` | Stream logs from all services |
| `docker compose exec api bash` | Shell into the `api` service |
