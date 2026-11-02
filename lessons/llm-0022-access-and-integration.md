---
layout: "lesson"
chapter: 5
chapter_title: "Beyond a single text response"
lesson_id: "llm-0022"
title: "Separate the model from where you run it"
description: "Use the full pipeline to interpret hosted products, open weights, local inference, and rankings."
curriculum_home: "/llms.html"
curriculum_title: "How LLMs Work — Karpathy"
prev: "llm-0021-agents-and-state.html"
prev_title: "Long-running agents expose the problem of state"
next: null
next_title: null
knowledge_check: [{"q": "How can one open-weight model appear through different interfaces?", "a": "Different services or local software can run inference using the released model artifact."}, {"q": "Where do distillation and reduced precision fit in this source?", "a": "They are mentioned as ways smaller or less memory-intensive versions can support local inference."}, {"q": "Why are leaderboard ranks not part of the engine’s explanation?", "a": "They compare observed performance or preference externally; they do not specify the model’s training and inference mechanism."}, {"q": "What connection closes the curriculum?", "a": "A user query becomes context for token generation by a model shaped through training; tools and interfaces surround that engine, and outputs still need checking."}]
---

*This lesson zooms into the distinction between a model artifact and its inference environment from the Chapter 5 map. Place it within beyond a single text response in the domain map before reading.*

**Primary video:** [03:15:15–03:31:23](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11715s). Watch the linked passage alongside this orientation lesson. Historical examples refer to February 2025.

## An artifact and an interface are different objects

Karpathy distinguishes proprietary chat services, services that run open-weight models, and running a smaller model locally. An open-weight release is an artifact that different inference environments can run. A chat interface is one way of interacting with a running model. [Source: 03:18:34–03:21:46.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11914s)

His local demonstration mentions smaller distilled versions and reduced numerical precision as ways to make a model fit available hardware. Those are orientation points, not installation instructions or a claim that any named model fits your computer. [Source: 03:19:57–03:21:46.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11997s)

## Rankings belong outside the core mechanism

The lecture shows a human-comparison leaderboard, a newsletter, and social feeds as ways to follow the field. Karpathy also qualifies how much he trusts rankings. Treat the shown ranks, named services, and personal recommendations as a February 2025 snapshot. The curriculum does not turn them into a current buying guide. [Source: 03:15:15–03:18:34.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11715s)

## Reconnect the whole course

The closing synthesis returns to the original question: what happens when someone enters a query? Text is represented in a conversation sequence; the trained model generates tokens; its response tendencies reflect pretraining and post-training. Tools can supply more information or computation, but the resulting product still needs checking. [Source: 03:21:46–03:31:23.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=12106s)

Your orientation target is to place an unfamiliar term in that map: representation, learned weights, training signal, current context, evaluator, tool, or hosting environment. When a term cannot yet be placed, return to the relevant primary video segment. The curriculum supplies the route; it does not establish mastery by being read.
