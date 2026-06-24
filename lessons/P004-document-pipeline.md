---
layout: project
lesson_id: "P004"
chapter: 2
chapter_title: "AI System Design"
project_type: "Project"
title: "Build a multi-step document processing pipeline"
description: "Estimated time: 3–4 hours"
prev: "0014-evaluator-router.html"
prev_title: "Evaluator-optimizer and LLM routers"
next: "0015-langchain-langgraph.html"
next_title: "LangChain and LangGraph — orchestration explained"
prereqs:
  - "Lessons 11–14: chaining, parallelization, tool calling, evaluator-optimizer, LLM routers"
  - "Chapter 1 Project P002: document summarizer (reuse file-reading code)"
---

## Overview

You have learned chaining, parallelization, tool calling, evaluator-optimizer, and LLM routers. This project wires them all together into a single production-shaped pipeline with no framework — raw API calls and Pydantic only.

The pipeline accepts one or more raw text documents, runs them through a series of AI steps, and emits a structured intelligence package for each document.

{% include prereqs.html %}

## Pipeline specification

Each document passes through these steps in order:

1. **Ingest:** read file from disk (.txt or .pdf), count words, detect language (code — no LLM)
2. **Extract:** LLM call — extract named entities (people, organisations, dates, amounts) as structured output
3. **Classify:** LLM router — classify document type and route to the appropriate summariser
4. **Summarise:** Specialist LLM call matched to document type (legal/financial/general), with evaluator ensuring summary passes a quality bar (score ≥ 7/10)
5. **Emit:** write `output/<filename>.json` containing the full intelligence package

Steps 1–5 run in sequence per document. Multiple documents are processed in **parallel** using `asyncio.gather()`, capped at 5 concurrent documents.

## Output schema

Each output JSON file must match this Pydantic model:

```python
from pydantic import BaseModel
from typing import Optional

class Entities(BaseModel):
    people: list[str]
    organisations: list[str]
    dates: list[str]
    monetary_amounts: list[str]

class DocumentIntelligence(BaseModel):
    filename: str
    word_count: int
    language: str
    document_type: str         # from router
    entities: Entities
    summary: str               # evaluated and approved
    summary_score: int         # evaluator's final score (1–10)
    key_points: list[str]
    risk_flags: list[str]      # empty if none detected
    processing_time_s: float
```

## Usage

```bash
# Process one document
uv run pipeline.py docs/contract.txt

# Process a whole folder in parallel
uv run pipeline.py docs/

# Show a summary table instead of JSON files
uv run pipeline.py docs/ --report
```

**Report output example:**

```text
╔══════════════════════╦══════════════╦═══════╦═══════╦═══════════╗
║ File                 ║ Type         ║ Words ║ Score ║ Time      ║
╠══════════════════════╬══════════════╬═══════╬═══════╬═══════════╣
║ contract.txt         ║ legal        ║ 3,241 ║  8/10 ║ 6.2s      ║
║ q3_report.txt        ║ financial    ║ 1,847 ║  9/10 ║ 4.8s      ║
║ support_email.txt    ║ general      ║   312 ║  8/10 ║ 3.1s      ║
╚══════════════════════╩══════════════╩═══════╩═══════╩═══════════╝
Total: 3 docs | 14.1s parallel (vs ~24s sequential)
```

## Requirements

- No LangChain, LangGraph, or PydanticAI — raw OpenAI SDK only
- Each step is a separate function with typed inputs and outputs
- Evaluator loop: max 3 iterations; threshold: score ≥ 7
- Router categories: "legal", "financial", "technical", "general"
- Parallel processing with `asyncio.gather()` and a semaphore of 5
- All output written to `output/` directory (created automatically)
- Errors per document are caught and written to `output/<filename>.error.json` rather than crashing the batch
- Processing time measured per document and in total
- Token count and cost logged to `pipeline_costs.jsonl`

## Suggested build order

1. Define all Pydantic models first (types are the contract).
2. Implement the sync pipeline steps (ingest → extract → classify → summarise → emit) and test on a single file.
3. Wrap pipeline execution in `async def process_document(path)`.
4. Add the `asyncio.gather()` batch runner.
5. Add `--report` table output.
6. Add error handling per document.
7. Add cost logging.

## Completion checklist

- [ ] `uv run pipeline.py docs/contract.txt` writes a valid JSON output file
- [ ] Output JSON matches the `DocumentIntelligence` schema
- [ ] Router correctly identifies at least two different document types in a mixed batch
- [ ] Evaluator retries at least once on a deliberately bad summary (test by temporarily breaking the generator prompt)
- [ ] Parallel batch is visibly faster than sequential for 5+ documents
- [ ] A file that fails extraction writes a `.error.json` without stopping the rest
- [ ] `pipeline_costs.jsonl` accumulates one entry per document
- [ ] `--report` prints a formatted table

## Extension challenges

- **Incremental processing:** skip files where an output JSON already exists (idempotent batch)
- **Retry on API error:** wrap each step with exponential backoff, log failures separately
- **Cross-document synthesis:** after processing all documents, add a final LLM call that writes a one-page executive overview of the whole batch
