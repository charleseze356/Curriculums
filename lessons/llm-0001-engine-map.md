---
layout: "lesson"
chapter: 1
chapter_title: "The token prediction engine"
lesson_id: "llm-0001"
title: "The map: training builds the engine; inference runs it"
description: "Start with four objects: source text, tokens, learned weights, and the current context."
curriculum_home: "/llms.html"
curriculum_title: "How LLMs Work — Karpathy"
prev: null
prev_title: null
next: "llm-0002-data-selection.html"
next_title: "Data selection determines what the model gets to learn from"
knowledge_check: [{"q": "Where do weights enter the map?", "a": "Training establishes the weights; inference uses them to turn context into next-token probabilities."}, {"q": "Why learn the prediction engine before assistant behavior?", "a": "Conversation training still works with token sequences, so assistant behavior is easier to place once the underlying loop is clear."}, {"q": "What changes when another token is generated?", "a": "The context sequence grows. In the ordinary inference setup described in this lecture, that does not update the weights."}, {"q": "Where do the later reliability lessons belong?", "a": "They describe consequences of the engine, its training signals, and the information available in its context."}]
---

*This is the map lesson for The token prediction engine. Every subsequent lesson in this chapter hangs off the framework established here.*

**Primary video:** [00:00:00–00:01:00](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=0s) · [00:14:27–00:20:11](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=867s) · [00:26:01–00:31:09](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1561s) · [03:21:46–03:25:30](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=12106s). Watch the linked passage alongside this orientation lesson. Historical examples refer to February 2025.

## The relationship to keep in view

Karpathy builds the explanation around a sequence: collect text, represent it as tokens, train a neural network to predict the next token, and then use that network to generate text. The output of pretraining is a **base model**. Later training makes it behave like an assistant. [Source: 00:14:27–00:20:11; 03:21:46–03:25:30.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=867s)

```text
Internet text → tokens → training → learned weights
                                      ↓
Current context → model with those weights → next-token probabilities
       ↑                                      ↓
       └──────── append a selected token ──────┘
```

The upper line changes the model’s weights. The loop underneath uses those weights. **A growing conversation and a training update are different kinds of change.** That distinction will later explain why supplying a document can improve an answer without retraining the model. [Source: 00:26:01–00:31:09.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1561s)

## The route through this curriculum

First understand the engine. Then learn how assistant behavior is taught. Next compare imitation with reinforcement learning. Only then derive the sharp edges: unsupported facts, fragile arithmetic, spelling failures, and unreliable self-description. The final chapter extends this frame to other media and longer tasks.

This order is an editorial dependency map; the claims come from the lecture. You do not need coding or calculus to follow its general-audience explanation. The first goal is to place each new term in this mechanism, rather than memorize a vocabulary list.

## Before moving on

Locate **weights** and **context** in the diagram. Every later lesson will change one of the inputs, one training signal, or how the loop is used. That gives you a place to attach the detail before studying it.
