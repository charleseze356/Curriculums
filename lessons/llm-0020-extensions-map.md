---
layout: "lesson"
chapter: 5
chapter_title: "Beyond a single text response"
lesson_id: "llm-0020"
title: "The map: new media still need a representation"
description: "Multimodality extends the inputs and outputs around the core learning framework."
curriculum_home: "/llms.html"
curriculum_title: "How LLMs Work — Karpathy"
prev: "llm-0019-representation-and-jaggedness.html"
prev_title: "Easy for a person can be awkward for token prediction"
next: "llm-0021-agents-and-state.html"
next_title: "Long-running agents expose the problem of state"
knowledge_check: [{"q": "How does multimodality connect to tokenization?", "a": "Both require representing source material in a form the model can process."}, {"q": "Why is this not a specification for all multimodal architectures?", "a": "The lecture provides a baseline conceptual sketch rather than implementation details for every system."}, {"q": "How do media, workflow length, and hosting differ?", "a": "They concern representation, action over time, and the location or service used for inference."}, {"q": "Why must this chapter retain the publication date?", "a": "Its future-looking product and research statements describe the speaker’s February 2025 outlook."}]
---

*This is the map lesson for Beyond a single text response. Every subsequent lesson in this chapter hangs off the framework established here.*

**Primary video:** [03:09:39–03:11:17](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11379s). Watch the linked passage alongside this orientation lesson. Historical examples refer to February 2025.

## Extend the representation branch

Karpathy’s future-looking section begins with multimodality. He sketches how audio and images can be represented as sequences or units that a model can process alongside text. His examples include slices of audio representations and image patches. [Source: 03:09:39–03:11:17.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11379s)

```text
Text ─────┐
Audio ────┼→ suitable representations → model context and prediction
Images ───┘
```

The orientation connection is to the tokenizer lesson: visible or audible material needs a machine representation. The lecture gives a baseline conceptual route, not a complete architecture specification for every multimodal system. Do not assume all implementations use identical token vocabularies or processing paths.

## Place the next extensions

The next lesson changes the time horizon from one response to a sequence of actions. The final lesson distinguishes the model artifact from the service or local application that runs it. These are different extensions around the engine: **what it can represent**, **how long a workflow runs**, and **where inference takes place**. [Source: 03:11:17–03:21:46.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11477s)

## Read this chapter with a date attached

This section contains forecasts from February 2025. Study the conceptual connections without treating phrases about what is “coming” as a report of November 2026 product availability. No current vendor comparison or purchasing recommendation is being made here.

The map is complete when these extensions have a place beside the core training/inference distinction, rather than becoming disconnected new buzzwords.
