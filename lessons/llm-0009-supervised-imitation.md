---
layout: "lesson"
chapter: 2
chapter_title: "From base model to assistant"
lesson_id: "llm-0009"
title: "Supervised fine-tuning teaches by example"
description: "Desired responses and labeling instructions shape the assistant’s behavior."
curriculum_home: "/llms.html"
curriculum_title: "How LLMs Work — Karpathy"
prev: "llm-0008-conversation-protocol.html"
prev_title: "Conversation structure becomes a token sequence"
next: "llm-0010-outcome-learning-map.html"
next_title: "The map: imitation and outcome feedback teach differently"
knowledge_check: [{"q": "Where do behavior guidelines influence the model?", "a": "They guide the example conversations used in supervised training."}, {"q": "Why can an assistant answer a new travel query?", "a": "The lecture describes pretraining knowledge combining with the response patterns learned in post-training."}, {"q": "How does synthetic data fit this map?", "a": "A model can help generate training examples, while curation still determines what behavior is selected for training."}, {"q": "What new relationship will reinforcement learning add?", "a": "Feedback on generated attempts, instead of only imitation of a supplied ideal response."}]
---

*This lesson zooms into supervision through example responses from the Chapter 2 map. Place it within from base model to assistant in the domain map before reading.*

**Primary video:** [01:01:06–01:05:01](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3666s) · [01:10:00–01:20:32](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=4200s). Watch the linked passage alongside this orientation lesson. Historical examples refer to February 2025.

## The training target is an example response

Supervised fine-tuning uses conversations with desired assistant responses. In Karpathy’s account, labelers construct prompts and ideal replies under instructions about helpfulness, truthfulness, and which requests to refuse. The network is trained to imitate these examples. [Source: 01:01:06–01:05:01; 01:10:00–01:12:16.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3666s)

This gives you a causal chain:

```text
Behavior guidelines → example conversations → training → response tendencies
```

## Broad knowledge and response style combine

Pretraining already supplies many patterns and facts. The conversation dataset teaches a way of responding using that foundation. A new query need not be an exact duplicate of a training conversation for the model to produce a response in the learned style. Karpathy illustrates this with travel questions. [Source: 01:17:00–01:20:32.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=4620s)

## Human curation and synthetic material

The lecture discusses model-assisted and synthetic conversation data as part of the later dataset-building stack. Keep the distinction between where an example is generated and who chooses the behavior it is intended to teach. Karpathy’s shorthand of simulating a labeler is a pedagogical account of the learned response pattern, not a claim that one literal person is answering you. [Source: 01:12:16–01:20:32; 02:08:57.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=4336s)

## Why this precedes reinforcement learning

An ideal worked response is one kind of supervision. Scoring a model’s own attempted response is another. The next chapter turns on that change in feedback, while keeping the token-generation engine in view. [Source: 02:11:18–02:14:42.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=7878s)
