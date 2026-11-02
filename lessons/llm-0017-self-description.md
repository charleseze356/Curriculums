---
layout: "lesson"
chapter: 4
chapter_title: "Why useful models still fail"
lesson_id: "llm-0017"
title: "A model’s self-description is generated output"
description: "Identity answers depend on training and supplied context, not privileged introspection."
curriculum_home: "/llms.html"
curriculum_title: "How LLMs Work — Karpathy"
prev: "llm-0016-grounding-and-tools.html"
prev_title: "Grounding puts the source into the current context"
next: "llm-0018-computation-over-tokens.html"
next_title: "Intermediate tokens can carry intermediate computation"
knowledge_check: [{"q": "Why is “Who built you?” not a privileged diagnostic query?", "a": "The answer is generated from learned patterns and context, so it can itself be mistaken."}, {"q": "How do identity examples and a system message differ?", "a": "Examples affect learned response tendencies through training; a system message supplies context at inference."}, {"q": "Why does a wrong vendor name not prove a particular training-data source?", "a": "The response may reflect a learned association or other supplied information; the output alone does not identify the cause."}, {"q": "What should remain separate from this model-level explanation?", "a": "Application storage, conversation history, and memory features, which are not fully specified by the lecture."}]
---

*This lesson zooms into the source of generated identity claims from the Chapter 4 map. Place it within why useful models still fail in the domain map before reading.*

**Primary video:** [01:41:46–01:46:56](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=6106s). Watch the linked passage alongside this orientation lesson. Historical examples refer to February 2025.

## The same prediction process answers identity questions

Karpathy asks models who built them and shows that a response can be wrong. A fluent self-description is still an output of the model’s learned patterns and present context. It is not an independent inspection of the serving infrastructure. [Source: 01:41:46–01:44:23.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=6106s)

The Falcon example claims an OpenAI identity. Karpathy argues that this alone does not prove a particular training-data origin; it can also be a plausible learned association with the assistant role. Keep his explanation at the level of a proposed interpretation of the example. [Source: 01:42:33–01:44:23.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=6153s)

## Two ways to supply an identity

The lecture gives an OLMo dataset example with explicit identity conversations. Training on such examples changes what the model is likely to answer. It also shows a system-message approach that places identity information in the context. [Source: 01:44:23–01:46:56.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=6263s)

| Route | Where it acts |
|---|---|
| Identity examples during fine-tuning | Learned response tendencies in the weights |
| Identity text in a system message | Information in the current context |

## The connection back to the engine

Both routes influence generated text, but they enter at different places. This is another application of the weights/context distinction. The lecture’s remarks about no persistent self concern the model-level explanation being presented; they should not be expanded into a claim that every chat application lacks stored history or memory features. Those application features are outside this source’s detailed treatment.

When identifying a deployed model, treat a generated identity claim as a claim to verify against actual configuration or provider information.
