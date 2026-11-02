---
layout: "lesson"
chapter: 2
chapter_title: "From base model to assistant"
lesson_id: "llm-0007"
title: "A base model continues a document"
description: "Autocomplete explains both surprising knowledge and the need for assistant training."
curriculum_home: "/llms.html"
curriculum_title: "How LLMs Work — Karpathy"
prev: "llm-0006-assistant-map.html"
prev_title: "The map: an assistant is a trained role"
next: "llm-0008-conversation-protocol.html"
next_title: "Conversation structure becomes a token sequence"
knowledge_check: [{"q": "Why might a base model continue a question with more questions?", "a": "Its learned task is plausible text continuation rather than consistently taking the assistant role."}, {"q": "How do few-shot dialogue examples change its behavior?", "a": "They supply a context pattern whose likely continuation resembles an assistant turn."}, {"q": "Why does a memorized passage not establish universal exact recall?", "a": "The lecture also shows approximate and drifting continuation; memorization is uneven."}, {"q": "How does a weights release connect to training and inference?", "a": "It distributes learned parameter values that can be used for inference without rerunning the original training."}]
---

*This lesson zooms into base-model continuation behavior from the Chapter 2 map. Place it within from base model to assistant in the domain map before reading.*

**Primary video:** [00:42:52–00:59:23](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=2572s). Watch the linked passage alongside this orientation lesson. Historical examples refer to February 2025.

## Continuation is the default task

Karpathy calls a base model an internet-document simulator. It can produce continuations with patterns learned during pretraining, but it has not yet been specifically trained to answer as a conversational assistant. A bare question may therefore lead to more questions or some other plausible continuation. [Source: 00:43:18; 00:57:00–00:59:23.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=2598s)

## Why a prompt can still elicit a role

His few-shot conversation demonstration places human/assistant examples before a new question. The continuation then resembles the assistant turns in that context. The same model may also continue inventing later human turns, which makes the distinction between continuation and a controlled assistant interaction visible. [Source: 00:54:00–00:59:23.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3240s)

## Recollection is uneven

The lecture contrasts approximate recall of knowledge with an example that reproduces substantial Wikipedia text. Memorization can occur, but it does not make every answer an exact lookup. Common patterns may be recalled more reliably than rare details, and a continuation can drift. [Source: 00:49:00–00:54:00.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=2940s)

## A released model is an artifact

Karpathy describes a release in terms of code for the network’s computations and the learned parameter values. Downloading weights means receiving the result of a training process; it does not mean repeating that training. His GPT-2 and Llama examples make this concrete. [Source: 00:44:01–00:47:40.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=2641s)

Carry forward the role distinction. Post-training makes assistant responses more consistent than merely hoping a general document continuation lands in the desired role.
