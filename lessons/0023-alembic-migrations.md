---
layout: lesson
lesson_id: "0023"
chapter: 3
chapter_title: "Production AI Backends"
title: "Database migrations with Alembic"
description: "30–40 min read · Hands-on"
prev: "0022-postgres-sqlalchemy.html"
prev_title: "PostgreSQL and SQLAlchemy"
next: "P008-docker-postgres.html"
next_title: "Project: Containerize your API"
prereqs:
  - "[Lesson 22](0022-postgres-sqlalchemy.html): SQLAlchemy models and the ORM — Alembic reads your SQLAlchemy models to generate migrations"
  - "[Lesson 21](0021-docker-for-ai.html): Docker — Postgres should be running via `docker compose`"
assignment:
  article:
    title: "Developing and Testing an Async API with FastAPI and SQLAlchemy"
    url: "https://testdriven.io/blog/fastapi-sqlalchemy/"
    author: "TestDriven.io"
    time: "about 10 minutes (the \"Database Migrations\" section specifically)"
    why: "TestDriven.io covers the Alembic setup in the context of a real async FastAPI app — the exact stack you're building. Seeing how another practitioner structures the env.py configuration and migration workflow reinforces the pattern from this lesson."
  task:
    description: "Set up Alembic for your Project 7 backend."
    steps:
      - "Run `alembic init alembic` and configure `env.py` to use your `DATABASE_URL` env var and your `Base.metadata`"
      - "Generate the initial migration: `alembic revision --autogenerate -m \"create_initial_tables\"`"
      - "Inspect the generated file — confirm it creates `conversations` and `messages` tables"
      - "Drop the tables Lesson 22 created (if any) and apply the migration cleanly: `alembic upgrade head`"
      - "Add a `cost_usd` float column (nullable) to your `Message` model, generate a second migration, and apply it"
      - "Run `alembic history` to confirm both migrations are listed"
      - "Test rollback: `alembic downgrade -1`, confirm the column is gone, then `alembic upgrade head` to re-apply"
    expected: "Two migration files in `alembic/versions/`, both applied. `alembic current` shows the latest revision."
    why: "Every production AI backend uses database migrations. Running through add, apply, rollback, re-apply builds the muscle memory for the workflow before you need it under pressure."
knowledge_check:
  - q: "What is the difference between `alembic revision --autogenerate` and `alembic revision`?"
    a: "`--autogenerate` compares your SQLAlchemy models against the current database schema and generates the migration code automatically. Plain `alembic revision` creates an empty migration file with blank `upgrade()` and `downgrade()` functions that you fill in manually — useful for changes autogenerate cannot detect (renames, custom SQL, etc.)."
    section: "#creating-migrations"
    section_title: "Creating migrations"
  - q: "Why do you need a synchronous database driver (psycopg2) for Alembic, even though your application uses asyncpg?"
    a: "Alembic's migration runner is synchronous — it does not use asyncio. Asyncpg requires an async event loop to operate. Using asyncpg in a synchronous context would crash. Alembic uses a separate connection URL (with a sync driver) only for applying migrations; your FastAPI application keeps its own async connection URL for runtime queries."
    section: "#setup"
    section_title: "asyncpg vs psycopg2"
  - q: "What happens if you run `alembic upgrade head` when the database is already at head?"
    a: "Nothing — Alembic checks the `alembic_version` table in the database, sees that the current revision matches the latest migration file, and exits with \"No migrations to apply.\" This makes it safe to run `upgrade head` on every container startup without worrying about double-applying migrations."
    section: "#docker-migrations"
    section_title: "Running migrations in Docker"
additional_resources:
  - title: "Alembic tutorial (official)"
    url: "https://alembic.sqlalchemy.org/en/latest/tutorial.html"
    desc: "The definitive reference; unusually clear for official docs"
  - title: "Autogenerate limitations"
    url: "https://alembic.sqlalchemy.org/en/latest/autogenerate.html"
    desc: "What autogenerate can and cannot detect"
  - title: "Alembic operations reference"
    url: "https://alembic.sqlalchemy.org/en/latest/ops.html"
    desc: "All `op.*` functions for manually written migrations"
---

## Motivation

Your AI backend ships, users store conversations, and a week later you need to add a `cost_usd` column to the messages table. How do you add that column to the live production database without deleting the existing data?

`Base.metadata.create_all()` from Lesson 22 cannot help — it only creates tables that don't exist yet. Manually running `ALTER TABLE` SQL against production is dangerous and untracked. **Database migrations** are the answer: version-controlled, repeatable, reversible SQL changes that you can apply in order on any environment. Alembic is the migration tool for SQLAlchemy — it is the standard for Python AI backends, and it is expected knowledge in AI engineering roles that touch production databases.

{% include prereqs.html %}

## What migrations are and why they exist {#what-migrations-are}

A **migration** is a Python script that describes one specific change to a database schema — adding a column, dropping a table, changing a column type. Each migration has two functions:

- `upgrade()` — applies the change (e.g. adds the column)
- `downgrade()` — reverses it (e.g. drops the column)

Alembic keeps track of which migrations have been applied in a special table in your database (`alembic_version`). When you run `alembic upgrade head`, it applies only the migrations that haven't been applied yet — in the correct order.

This gives you three things development-only tools like `create_all` cannot provide:

1. **Safety** — you can test on staging before touching production
2. **Reversibility** — you can roll back to the previous state if something breaks
3. **History** — every schema change is code-reviewed alongside the application code that uses it

## Setting up Alembic {#setup}

```bash
uv add alembic
```

Initialise Alembic in your project:

```bash
alembic init alembic
```

This creates an `alembic/` directory and an `alembic.ini` file:

```
your-project/
├── alembic/
│   ├── env.py              # migration environment configuration
│   ├── versions/           # individual migration files go here
│   └── script.py.mako      # template for new migration files
├── alembic.ini             # Alembic configuration
├── main.py
└── database.py
```

### Configure the database URL

Open `alembic.ini` and find the `sqlalchemy.url` line. Replace it with a reference to an environment variable (never hardcode credentials in a committed file):

```ini
# alembic.ini
sqlalchemy.url = %(DATABASE_URL)s
```

Then in `alembic/env.py`, read the variable from the environment:

```python
import os
from dotenv import load_dotenv

load_dotenv()

# Override the sqlalchemy.url with the env var
config.set_main_option("sqlalchemy.url",
    os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:password@localhost:5432/aidb")
)
```

<div class="callout warning">
<strong>asyncpg vs psycopg2 for Alembic:</strong> Alembic's migration runner is synchronous — it does not support asyncpg. Use a synchronous driver (<code>psycopg2</code> or the newer <code>psycopg</code>) for the Alembic connection URL, and keep the async URL (<code>asyncpg</code>) only for the application's runtime connection. Install: <code>uv add psycopg2-binary</code>.
</div>

### Point Alembic at your models

Alembic's autogenerate feature compares your SQLAlchemy models against the live database and generates the SQL to make them match. To enable this, open `alembic/env.py` and add your models' metadata:

```python
from database import Base   # your SQLAlchemy Base

# ... existing env.py code ...
target_metadata = Base.metadata  # ← replace "target_metadata = None" with this
```

## Creating and running migrations {#creating-migrations}

### Initial migration — create all tables

The first migration creates all your tables. Run autogenerate, which compares your models to the empty database and generates the SQL:

```bash
# Generate a migration script called "create_initial_tables"
alembic revision --autogenerate -m "create_initial_tables"
```

This creates a file in `alembic/versions/` like `abc123def456_create_initial_tables.py`. Open it and read what it generated — always review autogenerated migrations before running them:

```python
"""create initial tables

Revision ID: abc123def456
Revises:
Create Date: 2026-01-15 14:30:00.000000
"""
from alembic import op
import sqlalchemy as sa

def upgrade() -> None:
    op.create_table(
        'conversations',
        sa.Column('id',         sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('title',      sa.String(255), nullable=False),
        sa.Column('model',      sa.String(100), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table(
        'messages',
        sa.Column('id',              sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('conversation_id', sa.Integer(), nullable=False),
        sa.Column('role',            sa.String(20), nullable=False),
        sa.Column('content',         sa.Text(), nullable=False),
        sa.Column('tokens_used',     sa.Integer(), nullable=True),
        sa.Column('created_at',      sa.DateTime(), server_default=sa.func.now(), nullable=True),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )

def downgrade() -> None:
    op.drop_table('messages')
    op.drop_table('conversations')
```

Apply the migration:

```bash
alembic upgrade head
```

`head` means "apply all unapplied migrations up to the latest one". Check the database — the tables now exist.

### Adding a new column

Two weeks later, you want to track the cost in USD of each message. Add the column to your SQLAlchemy model first:

```python
class Message(Base):
    # ... existing columns ...
    cost_usd: Mapped[float | None] = mapped_column(Float, nullable=True)
```

Then generate a new migration:

```bash
alembic revision --autogenerate -m "add_cost_usd_to_messages"
```

Alembic compares the model definition against the current database schema and generates only the diff — in this case, an `ALTER TABLE`:

```python
def upgrade() -> None:
    op.add_column('messages', sa.Column('cost_usd', sa.Float(), nullable=True))

def downgrade() -> None:
    op.drop_column('messages', 'cost_usd')
```

Apply it:

```bash
alembic upgrade head
```

## Essential Alembic commands {#essential-commands}

| Command | What it does |
|---|---|
| `alembic revision --autogenerate -m "name"` | Generate a new migration by diffing models against the DB |
| `alembic revision -m "name"` | Create an empty migration to fill in manually |
| `alembic upgrade head` | Apply all unapplied migrations |
| `alembic upgrade +1` | Apply the next migration only |
| `alembic downgrade -1` | Undo the last applied migration |
| `alembic downgrade base` | Undo all migrations (empty DB) |
| `alembic current` | Show which migration the DB is currently at |
| `alembic history` | Show the full migration history |
| `alembic show <revision_id>` | Show the SQL a migration would run |

## The standard migration workflow {#workflow}

Once Alembic is set up, the workflow for every schema change is the same:

1. **Change the SQLAlchemy model** — add the column, table, or index
2. **Generate the migration** — `alembic revision --autogenerate -m "description"`
3. **Review the generated file** — autogenerate is good but not perfect; always read it
4. **Test locally** — `alembic upgrade head` against your dev database
5. **Commit both files** — the model change and the migration file in the same commit
6. **Apply in production** — `alembic upgrade head` as part of your deploy process

<div class="callout warning">
<strong>Autogenerate limitations:</strong> Alembic cannot autogenerate everything. It does not detect: column renames (it sees a drop + add), custom server defaults, or changes to stored procedures. For these, write the migration manually using <code>alembic revision -m "name"</code> and fill in the <code>op.*</code> calls.
</div>

## Running migrations in Docker {#docker-migrations}

In a Dockerised setup, you run migrations before starting the application. The simplest approach is an entrypoint script:

```bash
#!/bin/bash
# entrypoint.sh
set -e

echo "Running database migrations..."
alembic upgrade head

echo "Starting application..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
```

Update the Dockerfile to use it:

```dockerfile
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh
CMD ["./entrypoint.sh"]
```

Now every time the container starts, it first applies any pending migrations, then starts the server. This is safe because Alembic's migration tracking is idempotent — running `upgrade head` when already at `head` does nothing.
