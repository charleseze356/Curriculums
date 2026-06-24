---
layout: lesson
lesson_id: "0015"
chapter: 2
chapter_title: "AI System Design"
title: "LangChain and LangGraph — orchestration explained"
description: "35–45 min read · Hands-on coding"
prev: "P004-document-pipeline.html"
prev_title: "Project: Document pipeline"
next: "0016-pydantic-ai.html"
next_title: "PydanticAI"
prereqs:
  - "Lessons 11–14: you built pipelines, tool calling, agents, and routers from scratch — this lesson shows what a framework does differently"
  - "Install: `uv add langchain langchain-openai langgraph`"
assignment:
  article:
    title: "LangGraph: Multi-Agent Workflows"
    url: "https://blog.langchain.dev/langgraph/"
    author: "LangChain blog"
    time: "about 10 minutes"
    why: "The original LangGraph announcement from the team that built it, explaining the graph-based model and why it was designed to replace the LangChain agent executor. Provides context for why LangGraph exists separately from LangChain."
  task:
    description: "Reimplement the document intelligence pipeline from P004 using LangGraph."
    steps:
      - "Define a `PipelineState` TypedDict with the same fields as `DocumentIntelligence`"
      - "Create nodes: `ingest`, `extract`, `classify`, `summarise`, `evaluate`"
      - "Add a conditional edge from `evaluate`: retry `summarise` if score < 7, else end"
      - "Run on three documents and compare the output to your P004 version"
    expected: "Same `DocumentIntelligence` JSON as P004, produced by a LangGraph workflow."
    why: "Implementing the same pipeline in both styles builds direct intuition for where a framework adds value (state management, branching) and where it adds friction (more setup, harder to customise)."
knowledge_check:
  - q: "What does the `|` operator do in LangChain LCEL?"
    a: "It pipes the output of one component as the input of the next. A chain defined as `prompt | llm | parser` automatically passes the formatted prompt to the LLM, then passes the LLM's response to the parser. Each component is called in sequence when `chain.invoke()` is called."
    section: "#lcel"
    section_title: "LCEL"
  - q: "What are the three parts of every LangGraph workflow?"
    a: "**State** — a TypedDict that flows through every node, holding all data the workflow produces. **Nodes** — Python functions that read from state and return state updates. **Edges** — connections between nodes, either fixed (`add_edge`) or conditional (`add_conditional_edges`)."
    section: "#langgraph"
    section_title: "LangGraph fundamentals"
  - q: "When should you choose raw API over LangGraph?"
    a: "For simple linear pipelines (3–5 steps with no branching), when you need tight control over every token sent (frameworks can add prompt overhead), or when debuggability is the priority (raw API stack traces are more transparent). LangGraph earns its setup cost only for workflows with real branching, state persistence, or human-in-the-loop requirements."
    section: "#when-framework"
    section_title: "When to use a framework vs raw API"
additional_resources:
  - title: "LangGraph documentation"
    url: "https://langchain-ai.github.io/langgraph/"
    desc: "Full reference; especially the tutorials on human-in-the-loop and multi-agent supervisor patterns"
  - title: "LangChain LCEL documentation"
    url: "https://python.langchain.com/docs/expression_language/"
    desc: "Full reference for the pipe syntax and streaming"
---

## Motivation

Every AI engineering job posting lists LangChain or LangGraph. Every second tutorial uses them. You need to know what they do, when they help, and — critically — when they make things worse. The AI engineering community is split: some teams use LangChain for everything; others refuse to touch it. This lesson gives you the knowledge to form your own informed position.

{% include prereqs.html %}

## What LangChain is — and what it is not {#what-langchain-is}

**LangChain** is a Python (and JavaScript) library that provides abstractions for building LLM applications: standard interfaces for LLMs, prompt templates, output parsers, memory, retrievers, and chains. It appeared in 2023 at the start of the LLM engineering boom and became widely adopted quickly.

LangChain's abstractions are useful when they match your problem. They become a liability when they do not — the library has a reputation for complex abstractions that can obscure what is actually happening and make debugging harder.

### What LangChain is good at

- Standardising calls to multiple LLM providers (OpenAI, Anthropic, local models) behind one interface
- Prompt template management with variable injection
- Rapid prototyping — assembling a working pipeline in 20 lines
- The ecosystem: hundreds of integrations (vector stores, document loaders, tools)

### Where LangChain adds friction

- Opaque abstractions — a bug inside `LLMChain` is harder to debug than your own for-loop
- Rapid API churn — code written for LangChain 0.1 often breaks on 0.2 or 0.3
- Unnecessary abstraction for simple tasks — three lines of direct API code is better than five imports plus a chain definition

**Verdict:** Use LangChain for the integrations (retrievers, document loaders) and for LCEL (LangChain Expression Language) chains when you need rapid composition. Do not let it own your business logic. For anything complex, prefer LangGraph (below) or raw API.

## LCEL: LangChain Expression Language {#lcel}

Modern LangChain uses **LCEL** — a pipeline composition syntax using the `|` operator (pipe). A chain is a sequence of components piped together:

```python
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

llm = ChatOpenAI(model="gpt-4o-mini")

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant. Be concise."),
    ("user", "{question}"),
])

chain = prompt | llm | StrOutputParser()

result = chain.invoke({"question": "What is a vector database?"})
print(result)
```

The `|` operator wires components together: the prompt formats the input, the LLM generates a response, and the output parser extracts the text. Each component is called automatically with the previous component's output.

LCEL is elegant for simple, linear chains. For anything with branching or loops, use LangGraph.

## LangGraph — stateful, branching workflows {#langgraph}

**LangGraph** is a separate library from LangChain (same company, different package) that models AI workflows as graphs — nodes connected by edges. Nodes are Python functions that transform state; edges define which node runs next, with support for conditional branching.

LangGraph is designed for the patterns you built in Lessons 13–14: agentic loops, evaluator-optimizer, routers with specialist sub-graphs. It provides:

- **Explicit state management:** the full pipeline state is typed and inspectable at every node
- **Conditional edges:** route to different nodes based on state values
- **Human-in-the-loop:** pause the graph for human approval before continuing
- **Persistence:** save and resume graph state across sessions
- **Streaming:** stream node outputs as they complete

### LangGraph fundamentals: State, Nodes, Edges

Every LangGraph workflow has three parts:

1. **State** — a TypedDict that flows through every node
2. **Nodes** — Python functions that read from state and return state updates
3. **Edges** — connections between nodes (fixed or conditional)

```python
from langgraph.graph import StateGraph, START, END
from langchain_openai import ChatOpenAI
from typing import TypedDict

llm = ChatOpenAI(model="gpt-4o-mini")

# ── State ─────────────────────────────────────────────────────
class State(TypedDict):
    document: str
    summary: str
    quality_score: int
    iterations: int

# ── Nodes ─────────────────────────────────────────────────────
def summarise(state: State) -> dict:
    feedback = f" Improve on: {state.get('feedback', '')}" if state.get('feedback') else ""
    response = llm.invoke(f"Summarise this document in 3 sentences.{feedback}\n\n{state['document']}")
    return {"summary": response.content, "iterations": state["iterations"] + 1}

def evaluate(state: State) -> dict:
    response = llm.invoke(
        f"Rate this summary 1-10 for accuracy and clarity. Reply with just the number.\n\nSummary: {state['summary']}"
    )
    try:
        score = int(response.content.strip())
    except ValueError:
        score = 5
    return {"quality_score": score}

def should_retry(state: State) -> str:
    if state["quality_score"] < 7 and state["iterations"] < 3:
        return "retry"
    return "done"

# ── Graph ─────────────────────────────────────────────────────
graph = StateGraph(State)
graph.add_node("summarise", summarise)
graph.add_node("evaluate",  evaluate)

graph.add_edge(START,       "summarise")
graph.add_edge("summarise", "evaluate")
graph.add_conditional_edges("evaluate", should_retry, {
    "retry": "summarise",   # loop back
    "done":  END,
})

app = graph.compile()

result = app.invoke({
    "document": "Your document text here...",
    "summary": "",
    "quality_score": 0,
    "iterations": 0,
})
print(f"Final summary (score {result['quality_score']}/10):")
print(result["summary"])
```

`add_conditional_edges()` is the key — it takes a function that reads state and returns a string key, then maps that key to the next node. This is how you implement the evaluator-optimizer loop, branching routers, and agentic loops with built-in state management.

## When to use a framework vs raw API {#when-framework}

| Situation | Recommendation |
|---|---|
| Prototype / proof of concept | LangChain LCEL — fastest to assemble |
| Stateful workflow with branching | LangGraph — built for this |
| Need human-in-the-loop approval | LangGraph — has native interrupt/resume |
| Simple linear pipeline, 3–5 steps | Raw API — less overhead, easier to debug |
| Production agentic system | LangGraph or PydanticAI (next lesson) |
| Tight control over every token | Raw API — frameworks can add unexpected prompt overhead |

<div class="callout info">
<strong>Career note:</strong> Many teams use raw API in production and LangGraph only for orchestration. Being fluent in both the raw API and LangGraph is the combination most valued in 2026 job postings.
</div>
