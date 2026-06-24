---
layout: lesson
lesson_id: "0025"
chapter: 3
chapter_title: "Production AI Backends"
title: "MCP servers — extending AI applications"
description: "30–40 min read · Hands-on coding"
prev: "0024-celery-workers.html"
prev_title: "Background workers with Celery"
next: "P009-ch3-ai-backend.html"
next_title: "Full AI backend service"
prereqs:
  - "[Lesson 12](0012-tool-calling.html): Tool calling — MCP generalises exactly this pattern"
  - "[Lesson 18](0018-fastapi-basics.html): FastAPI — MCP servers can optionally be exposed via HTTP"
assignment:
  article:
    title: "Introducing the Model Context Protocol"
    url: "https://www.anthropic.com/news/model-context-protocol"
    author: "Anthropic"
    time: "10 min"
    why: "This is the original announcement that explains *why* MCP exists — the problem it solves, who is adopting it, and the design philosophy behind the protocol. Understanding the \"why\" before the \"how\" is always more useful than jumping straight into implementation."
  task:
    description: "Build an MCP server that exposes your AI backend as tools."
    steps:
      - "Create `mcp_server.py` using the pattern in this lesson"
      - "Expose these three tools: `summarize_text` (calls your summarize logic), `classify_text` (calls your classify logic with hardcoded labels: technical/billing/feedback/other), and `count_tokens_estimate` (estimates token count as `len(text) // 4`, no LLM call needed)"
      - "Add a resource: `api://status` that returns a JSON object with the server's current status (uptime, tool names, version)"
      - "Test by running the programmatic client example from this lesson against your server and printing the results of all three tool calls"
      - "If you have Claude Desktop installed: add the server to your config and verify the tools appear in a conversation"
    expected: "The programmatic client successfully calls all three tools and prints their results. The resource returns a valid JSON status object."
    why: "MCP appears in interviews for senior AI engineering roles. Building a server from scratch — and seeing it work both with the SDK client and (optionally) in Claude Desktop — demystifies the protocol and makes you confident discussing it."
knowledge_check:
  - q: "What problem does MCP solve that regular tool calling does not?"
    a: "Regular tool calling requires you to integrate each tool separately into each AI application. MCP standardises the interface so a tool is defined once (in an MCP server) and any MCP-compatible client (Claude.ai, Claude Code, LangChain, custom agents) can use it without any per-client integration work. It is the USB standard for AI tools."
    section: "#what-mcp-is"
    section_title: "What MCP is"
  - q: "What is the difference between an MCP tool and an MCP resource?"
    a: "A **tool** is imperative — the LLM actively calls it to perform an action: run a query, send a message, transform data. A **resource** is declarative — the LLM reads it passively for context: a database record, a file, configuration. Tools do things; resources provide data."
    section: "#resources"
    section_title: "Resources — letting the LLM read data"
  - q: "What are the two transport options for MCP servers, and when would you use each?"
    a: "**Stdio** — the server runs as a subprocess on the same machine as the client, communicating via standard input/output. Use for local development tools, IDE plugins, and desktop apps. **HTTP with SSE** — the server runs as a web service reachable over the network. Use for shared servers accessed by multiple clients or deployed to the cloud."
    section: "#http-mcp"
    section_title: "Remote MCP servers over HTTP"
additional_resources:
  - title: "MCP specification"
    url: "https://modelcontextprotocol.io/"
    desc: "The full protocol specification and official SDK documentation"
  - title: "MCP Python SDK (GitHub)"
    url: "https://github.com/anthropics/mcp"
    desc: "Source code, examples, and the issue tracker for the Python implementation"
  - title: "MCP server examples"
    url: "https://github.com/modelcontextprotocol/servers"
    desc: "Official example servers (filesystem, GitHub, databases) — read these for idioms and best practices"
---

## Motivation

In Lesson 12 you saw tool calling: the LLM describes what function it wants to call, your code executes it and returns the result. This works well when you control both the LLM integration and the tools. But what if you want the same tool to work in Claude.ai, in a VS Code plugin, in your custom chatbot, and in a colleague's agent — without rebuilding the integration each time?

That is the problem the **Model Context Protocol (MCP)** solves. Introduced by Anthropic in late 2024 and rapidly adopted across the industry, MCP is a standardised protocol for exposing tools, resources, and prompts to AI applications. You build an MCP server once; any MCP-compatible client (Claude.ai, Claude Code, LangChain, LangGraph, custom agents) can connect and use your tools. MCP is becoming the standard interface layer for AI tooling — it appears in job descriptions and is expected knowledge at companies building serious AI products.

{% include prereqs.html %}

## What MCP is

MCP is a client-server protocol. The **MCP server** is a process that exposes capabilities — tools (functions the LLM can call), resources (data the LLM can read), and prompts (reusable prompt templates). The **MCP client** is the AI application that connects to the server and makes those capabilities available to the LLM.

Think of it like a USB standard: the USB port is MCP. Any USB device (your MCP server) works in any USB port (any MCP client). Before USB, every device needed a custom cable for every computer. Before MCP, every AI tool needed a custom integration for every AI application.

The protocol runs over **stdio** (for local servers) or **HTTP with SSE** (for remote servers). In both cases, the communication is JSON-RPC messages that follow the MCP specification.

### MCP vs REST API vs tool calling

| Approach | When to use it |
|----------|----------------|
| **Tool calling** (raw API) | You control the LLM integration and the tool definition. Single application, no sharing needed. |
| **REST API** | Your service needs to be called by other services, browsers, or humans — not just LLMs. |
| **MCP server** | You want multiple LLM clients (Claude.ai, your agent, a VS Code plugin) to use the same tools with zero per-client integration work. |

## Building an MCP server in Python

Anthropic publishes the official Python MCP SDK:

```bash
uv add mcp
```

Here is a minimal MCP server that exposes two tools — a database query tool and a summarization tool. When Claude connects to this server, it sees both tools and can choose to call them:

```python
import json
import asyncio
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp import types
from openai import OpenAI

# ── Create the MCP server ──────────────────────────────────────────────

server = Server("ai-backend-tools")
openai_client = OpenAI()


# ── Define tools ───────────────────────────────────────────────────────

@server.list_tools()
async def list_tools() -> list[types.Tool]:
    """Tell clients what tools this server provides."""
    return [
        types.Tool(
            name="summarize_text",
            description="Summarize a piece of text in a given number of sentences.",
            inputSchema={
                "type": "object",
                "properties": {
                    "text":      {"type": "string", "description": "The text to summarize"},
                    "sentences": {"type": "integer", "description": "Number of sentences in the summary", "default": 3},
                },
                "required": ["text"],
            },
        ),
        types.Tool(
            name="count_words",
            description="Count the number of words in a text string.",
            inputSchema={
                "type": "object",
                "properties": {
                    "text": {"type": "string", "description": "The text to count words in"},
                },
                "required": ["text"],
            },
        ),
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[types.TextContent]:
    """Execute a tool and return the result."""

    if name == "summarize_text":
        text      = arguments["text"]
        sentences = arguments.get("sentences", 3)
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "user",
                "content": f"Summarize the following in exactly {sentences} sentences:\n\n{text}",
            }],
        )
        summary = response.choices[0].message.content
        return [types.TextContent(type="text", text=summary)]

    elif name == "count_words":
        count = len(arguments["text"].split())
        return [types.TextContent(type="text", text=str(count))]

    else:
        return [types.TextContent(type="text", text=f"Unknown tool: {name}")]


# ── Run the server ──────────────────────────────────────────────────────

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(
            read_stream,
            write_stream,
            server.create_initialization_options(),
        )

if __name__ == "__main__":
    asyncio.run(main())
```

Run it: `python mcp_server.py`. The server starts and waits for a client to connect over stdio.

## Resources — letting the LLM read data

MCP resources are read-only data sources that a client can request. They are like files or database records that the LLM can read for context. Adding a resource to your server looks like this:

```python
@server.list_resources()
async def list_resources() -> list[types.Resource]:
    return [
        types.Resource(
            uri="conversations://recent",
            name="Recent Conversations",
            description="The 10 most recent conversations from the database",
            mimeType="application/json",
        ),
    ]

@server.read_resource()
async def read_resource(uri: str) -> str:
    if uri == "conversations://recent":
        # In practice: query your Postgres database here
        conversations = [
            {"id": 1, "title": "Python debugging session"},
            {"id": 2, "title": "API design review"},
        ]
        return json.dumps(conversations, indent=2)
    raise ValueError(f"Unknown resource: {uri}")
```

A client can now ask your server for `conversations://recent` and inject the response into the LLM's context automatically.

## Connecting an MCP server to Claude

The most direct way to test your MCP server is with Claude Desktop or Claude Code. Add your server to the configuration file:

```json
# ~/.claude/claude_desktop_config.json (macOS/Linux)
{
  "mcpServers": {
    "ai-backend-tools": {
      "command": "python",
      "args": ["/absolute/path/to/mcp_server.py"],
      "env": {
        "OPENAI_API_KEY": "sk-..."
      }
    }
  }
}
```

Restart Claude Desktop and the tools appear automatically. When you ask Claude to "summarize this text", it can choose to call your `summarize_text` tool.

### Connecting programmatically

You can also connect from your own Python code using the MCP client:

```python
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
import asyncio

async def use_mcp_server():
    server_params = StdioServerParameters(
        command="python",
        args=["mcp_server.py"],
    )
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            # List available tools
            tools = await session.list_tools()
            print("Available tools:", [t.name for t in tools.tools])

            # Call a tool
            result = await session.call_tool(
                "count_words",
                {"text": "The quick brown fox jumps over the lazy dog"},
            )
            print("Word count:", result.content[0].text)

asyncio.run(use_mcp_server())
```

## Remote MCP servers over HTTP

Stdio servers run locally on the same machine as the client. For servers you want to deploy and share over the network, MCP supports HTTP with Server-Sent Events (SSE). The Python SDK provides a built-in SSE transport:

```python
from mcp.server.sse import SseServerTransport
from fastapi import FastAPI
import uvicorn

app = FastAPI()
transport = SseServerTransport("/messages/")

# Mount the MCP transport on your FastAPI app
app.mount("/mcp", transport.router)

# Register tools the same way as stdio
@server.list_tools()
async def list_tools() -> list[types.Tool]:
    ...  # same as before

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
```

HTTP MCP servers integrate naturally into the Docker Compose stack you built in Lessons 21–23. A remote MCP server deployed to a cloud VM can serve dozens of AI applications simultaneously.

## Design decisions for MCP servers

### What to expose as a tool vs a resource

- **Tool** — the LLM actively calls it to do something: run a query, send a message, transform data. Tools are imperative — "do this."
- **Resource** — the LLM reads it passively for context: a database record, a file, a configuration value. Resources are declarative — "here is data."

### Tool description quality matters

The LLM decides when to call your tool based on the `description` field. A vague description leads to missed or incorrect calls. Follow the same principles as tool calling in Lesson 12: be specific about what the tool does, what input it expects, and what output it returns. Include examples in the description if the usage is non-obvious.

### Keep tools small and single-purpose

A tool called `do_everything` with 15 parameters is harder for the LLM to use correctly than five tools each with 3 parameters. The LLM has to reason about which tool to call and what arguments to pass — smaller, clearer tools reduce reasoning errors.
