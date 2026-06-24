---
layout: lesson
lesson_id: "0022"
chapter: 3
chapter_title: "Production AI Backends"
title: "PostgreSQL and SQLAlchemy for AI backends"
description: "35–45 min read · Hands-on coding"
prev: "0021-docker-for-ai.html"
prev_title: "Docker for AI applications"
next: "0023-alembic-migrations.html"
next_title: "Database migrations with Alembic"
prereqs:
  - "[Lesson 20](0020-async-python.html): Async Python — SQLAlchemy's async mode uses the same patterns"
  - "[Lesson 21](0021-docker-for-ai.html): Docker — PostgreSQL will run as a Docker container"
  - "Basic SQL: what a table is, what SELECT/INSERT/UPDATE mean. (If you need a refresher, any SQL tutorial's first 20 minutes is enough.)"
assignment:
  article:
    title: "Introduction to SQLAlchemy ORM"
    url: "https://realpython.com/python-sqlalchemy/"
    author: "Real Python"
    time: "about 15 minutes (\"Defining Models\" and \"Querying the Database\" sections)"
    why: "This article covers SQLAlchemy with the classic synchronous style — a good reference because most Stack Overflow answers and blog posts use it. Understanding the sync version makes async SQLAlchemy easier to reason about (the patterns are identical, just with async/await added)."
  task:
    description: "Add conversation persistence to your Project 7 AI backend."
    steps:
      - "Create a `database.py` with the `Conversation` and `Message` models from this lesson, the engine, and the `get_db` dependency"
      - "Add the startup event to create tables"
      - "Create a `routers/conversations.py` with at minimum: `POST /conversations` (start a new conversation) and `POST /conversations/{id}/messages` (send a message and get an AI reply)"
      - "Make sure the existing `/chat` endpoint still works — do not break previous functionality"
      - "Test end-to-end: create a conversation → send 3 messages → confirm each reply refers to the previous context (the LLM should remember what was said earlier in the conversation)"
    expected: "A multi-turn conversation stored in Postgres, retrievable after restarting the server. The LLM should demonstrate memory of the conversation by referencing earlier messages."
    why: "Conversation persistence is in every production chatbot. Building it from scratch with SQLAlchemy cements the ORM patterns before Alembic adds the migration layer on top in Lesson 23."
knowledge_check:
  - q: "What is the difference between an SQLAlchemy engine and a session?"
    a: "The **engine** manages the low-level connection pool to the database — it is created once and reused across all requests. The **session** is a per-request unit of work — it tracks changes, runs queries, and is created fresh for each request and closed when the request ends. Never share a session between requests."
    section: "#engine-session"
    section_title: "Engine and session"
  - q: "Why do you call `await session.refresh(obj)` after a commit?"
    a: "After a commit, SQLAlchemy expires the object — it clears cached attribute values because the database may have changed them (e.g. auto-incremented ID, server-generated timestamp). `refresh()` reloads the object from the database so you can access those database-generated values (like `id` and `created_at`)."
    section: "#crud"
    section_title: "CRUD: Create"
  - q: "What does `class Config: from_attributes = True` do in a Pydantic response model?"
    a: "It tells Pydantic to read field values from object attributes (like SQLAlchemy ORM objects), not just from dictionaries. Without it, passing an SQLAlchemy model instance to a Pydantic model raises a validation error because Pydantic expects a dict by default."
    section: "#fastapi-integration"
    section_title: "Wiring SQLAlchemy into FastAPI"
  - q: "Why should you not use `Base.metadata.create_all` in production?"
    a: "`create_all` only creates tables that don't exist yet — it cannot modify existing tables (add/remove/rename columns). In production, your database accumulates data over time. If you add a column to your model and restart the server, `create_all` silently does nothing to the existing table. Alembic (Lesson 23) handles these schema changes safely with tracked, reversible migrations."
    section: "#creating-tables"
    section_title: "Creating tables at startup"
additional_resources:
  - title: "SQLAlchemy 2.0 asyncio documentation"
    url: "https://docs.sqlalchemy.org/en/20/orm/extensions/asyncio.html"
    desc: "Complete reference for async SQLAlchemy"
  - title: "PostgreSQL tutorial"
    url: "https://www.postgresql.org/docs/current/tutorial.html"
    desc: "The official intro is unusually readable; useful if you want to understand SQL more deeply"
  - title: "Developing and Testing an Async API with FastAPI and SQLAlchemy"
    url: "https://testdriven.io/blog/fastapi-sqlalchemy/"
    desc: "A complete walkthrough of the async FastAPI + SQLAlchemy pattern with tests (TestDriven.io)"
---

## Motivation

Every AI API call you have made so far is stateless — the result is returned, printed, and lost. Real AI applications need persistence. A chatbot must remember conversation history. A document processor must store results so users can retrieve them later. An evaluation system must accumulate scores over time.

PostgreSQL is the standard relational database for AI backends. It is battle-tested, free, and has AI-specific extensions (pgvector for embeddings, which you will use in Chapter 4). SQLAlchemy is the Python library that connects to it — it handles the translation between Python objects and SQL tables, and its async mode integrates cleanly with the FastAPI patterns you built in Lessons 18–20.

{% include prereqs.html %}

## PostgreSQL in 5 minutes {#postgres-basics}

PostgreSQL (often called "Postgres") stores data in **tables**. A table has **columns** (with types) and **rows** (records). For an AI backend, you will typically have tables for:

- **conversations** — each row is one conversation with an ID and metadata
- **messages** — each row is one message (user or assistant), linked to a conversation
- **documents** — uploaded files with processing status
- **ai_results** — stored outputs from AI processing jobs

Postgres runs as a server process. You connect to it over TCP, usually from another container in the same Compose network. The connection is described by a **connection URL** that includes the driver, credentials, host, port, and database name:

```
postgresql+asyncpg://user:password@hostname:5432/database_name
#                 ↑ driver    ↑ credentials  ↑ host+port  ↑ db name
```

`asyncpg` is the async Postgres driver — the `+asyncpg` prefix tells SQLAlchemy to use it. You will need:

```bash
uv add sqlalchemy[asyncio] asyncpg
```

## Defining tables with SQLAlchemy {#sqlalchemy-models}

SQLAlchemy lets you define your tables as Python classes. Each class maps to one table; each class attribute maps to one column. This is called the **ORM (Object-Relational Mapper)** pattern.

Here are the models for a chat history system:

```python
from datetime import datetime
from sqlalchemy import String, Text, Integer, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class Conversation(Base):
    __tablename__ = "conversations"

    id:         Mapped[int]      = mapped_column(Integer, primary_key=True, autoincrement=True)
    title:      Mapped[str]      = mapped_column(String(255), nullable=False, default="New conversation")
    model:      Mapped[str]      = mapped_column(String(100), nullable=False, default="gpt-4o-mini")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    messages: Mapped[list["Message"]] = relationship("Message", back_populates="conversation",
                                                      cascade="all, delete-orphan")

class Message(Base):
    __tablename__ = "messages"

    id:              Mapped[int]   = mapped_column(Integer, primary_key=True, autoincrement=True)
    conversation_id: Mapped[int]   = mapped_column(ForeignKey("conversations.id"), nullable=False)
    role:            Mapped[str]   = mapped_column(String(20), nullable=False)   # user, assistant, system
    content:         Mapped[str]   = mapped_column(Text, nullable=False)
    tokens_used:     Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at:      Mapped[datetime]   = mapped_column(DateTime, server_default=func.now())

    conversation: Mapped[Conversation] = relationship("Conversation", back_populates="messages")
```

The `Mapped[T]` annotation tells SQLAlchemy and mypy what Python type the column should have. The `mapped_column()` call defines the SQL details. `relationship()` creates a Python-level link between related rows — loading a `Conversation` gives you its `messages` list automatically.

## Engine and session {#engine-session}

SQLAlchemy needs two things to work: an **engine** (the low-level connection pool to Postgres) and a **session** (the per-request unit of work that tracks changes and runs queries).

You create the engine once at startup and reuse it. You create a new session for each request and close it when the request is done. In FastAPI, sessions are handled via a dependency:

```python
import os
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from fastapi import Depends

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql+asyncpg://postgres:password@db:5432/aidb")

# Create the engine once (at module load time)
engine = create_async_engine(DATABASE_URL, echo=False)

# Session factory
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

# FastAPI dependency — provides one session per request
async def get_db() -> AsyncSession:
    async with AsyncSessionLocal() as session:
        yield session
        # session is automatically closed when the request ends
```

Now any route can receive a database session via `Depends(get_db)`.

## CRUD operations {#crud}

**CRUD** — Create, Read, Update, Delete — covers the four operations you do on database rows. Here is each one with the async SQLAlchemy pattern:

### Create

```python
from sqlalchemy.ext.asyncio import AsyncSession

async def create_conversation(session: AsyncSession, title: str, model: str) -> Conversation:
    conversation = Conversation(title=title, model=model)
    session.add(conversation)
    await session.commit()
    await session.refresh(conversation)   # loads the auto-generated id and created_at
    return conversation
```

### Read

```python
from sqlalchemy import select

async def get_conversation(session: AsyncSession, conversation_id: int) -> Conversation | None:
    result = await session.execute(
        select(Conversation).where(Conversation.id == conversation_id)
    )
    return result.scalar_one_or_none()   # None if not found

async def list_conversations(session: AsyncSession, limit: int = 20) -> list[Conversation]:
    result = await session.execute(
        select(Conversation).order_by(Conversation.created_at.desc()).limit(limit)
    )
    return list(result.scalars().all())
```

### Update

```python
async def update_conversation_title(
    session: AsyncSession,
    conversation_id: int,
    new_title: str
) -> Conversation | None:
    conversation = await get_conversation(session, conversation_id)
    if conversation is None:
        return None
    conversation.title = new_title
    await session.commit()
    await session.refresh(conversation)
    return conversation
```

### Delete

```python
async def delete_conversation(session: AsyncSession, conversation_id: int) -> bool:
    conversation = await get_conversation(session, conversation_id)
    if conversation is None:
        return False
    await session.delete(conversation)
    await session.commit()
    return True
```

## Wiring SQLAlchemy into FastAPI {#fastapi-integration}

Here is a complete router for conversation management — the database operations wrapped in FastAPI routes with Pydantic response models:

```python
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from database import get_db, Conversation, Message, create_conversation, get_conversation
from openai import AsyncOpenAI
from dependencies import get_client

router = APIRouter(prefix="/conversations", tags=["conversations"])

class ConversationCreate(BaseModel):
    title: str = "New conversation"
    model: str = "gpt-4o-mini"

class MessageCreate(BaseModel):
    content: str

class MessageResponse(BaseModel):
    id: int
    role: str
    content: str
    tokens_used: int | None

    class Config:
        from_attributes = True   # allow building from SQLAlchemy objects

class ConversationResponse(BaseModel):
    id: int
    title: str
    model: str
    messages: list[MessageResponse]

    class Config:
        from_attributes = True

@router.post("/", response_model=ConversationResponse)
async def start_conversation(
    body: ConversationCreate,
    db: AsyncSession = Depends(get_db),
):
    conversation = await create_conversation(db, title=body.title, model=body.model)
    return conversation

@router.post("/{conversation_id}/messages", response_model=MessageResponse)
async def send_message(
    conversation_id: int,
    body: MessageCreate,
    db: AsyncSession = Depends(get_db),
    client: AsyncOpenAI = Depends(get_client),
):
    conversation = await get_conversation(db, conversation_id)
    if conversation is None:
        raise HTTPException(404, "Conversation not found")

    # Save user message
    user_msg = Message(conversation_id=conversation_id, role="user", content=body.content)
    db.add(user_msg)
    await db.commit()

    # Build history for the LLM call
    history = [{"role": m.role, "content": m.content} for m in conversation.messages]

    # Call the LLM
    response = await client.chat.completions.create(
        model=conversation.model,
        messages=history,
    )
    ai_text   = response.choices[0].message.content
    tokens    = response.usage.total_tokens

    # Save assistant message
    ai_msg = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=ai_text,
        tokens_used=tokens,
    )
    db.add(ai_msg)
    await db.commit()
    await db.refresh(ai_msg)

    return ai_msg
```

## Creating tables at startup {#creating-tables}

For development, the quickest approach is to create all tables when the application starts (you will use proper migrations in Lesson 23 for production):

```python
from fastapi import FastAPI
from sqlalchemy.ext.asyncio import create_async_engine
from database import Base, DATABASE_URL

engine = create_async_engine(DATABASE_URL)

app = FastAPI()

@app.on_event("startup")
async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
```

`Base.metadata.create_all` creates all tables defined by classes that inherit from `Base`. If a table already exists, it is skipped. This is safe to call on every startup during development, but not in production (use Alembic instead — Lesson 23).
