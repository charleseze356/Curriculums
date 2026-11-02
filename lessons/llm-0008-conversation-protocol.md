---
layout: "lesson"
chapter: 2
chapter_title: "From base model to assistant"
lesson_id: "llm-0008"
title: "Conversation structure becomes a token sequence"
description: "Role markers let the same generation engine operate on multi-turn dialogue."
curriculum_home: "/llms.html"
curriculum_title: "How LLMs Work — Karpathy"
prev: "llm-0007-base-models.html"
prev_title: "A base model continues a document"
next: "llm-0009-supervised-imitation.html"
next_title: "Supervised fine-tuning teaches by example"
knowledge_check: [{"q": "How does multi-turn dialogue connect to the engine in Chapter 1?", "a": "A protocol encodes the messages and roles as a token sequence that the engine can continue."}, {"q": "Why must inference begin at an assistant position?", "a": "The context must indicate which role should produce the continuation."}, {"q": "What matters more than memorizing one set of special-token names?", "a": "Understanding that role and boundary information is represented in the model’s input sequence."}, {"q": "Where does a system identity message enter this picture?", "a": "It is additional context encoded into the conversation, rather than a direct change to model weights."}]
---

*This lesson zooms into the representation of dialogue as tokens from the Chapter 2 map. Place it within from base model to assistant in the domain map before reading.*

**Primary video:** [01:05:01–01:09:52](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3901s). Watch the linked passage alongside this orientation lesson. Historical examples refer to February 2025.

## The chat window hides a representation step

A conversation looks like a structured object: a user turn, an assistant turn, then a follow-up. The model still needs a one-dimensional token sequence. Karpathy shows a conversation protocol that intersperses role and boundary markers with message content. [Source: 01:05:01–01:08:05.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3901s)

```text
User message + assistant message + user follow-up
                         ↓ encode roles and boundaries
              one sequence of tokens
                         ↓ begin assistant continuation
                   generated reply
```

## Why role markers matter

The markers identify whose turn is represented and where turns start or end. These are part of the input sequence. At inference, the surrounding software constructs the conversation context and ends it where the assistant should begin generating. The next-token loop then continues from that position. [Source: 01:06:29–01:09:52.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3989s)

## Keep the concept; do not memorize the spelling

The lecture explicitly notes that formats differ between models. Its example marker names are an illustration of encoding, not a universal chat standard. The load-bearing relationship is **message structure → token representation → continuation**. [Source: 01:06:29; 01:08:05.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3989s)

This also creates a place in the map for system messages. Later, the lecture shows how an identity description inserted into the context can influence what a model says about itself. That is supplied information in the conversation representation, distinct from a weight update. [Source: 01:45:49–01:46:56.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=6349s)
