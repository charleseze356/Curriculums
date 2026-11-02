---
layout: "lesson"
chapter: 3
chapter_title: "Learning from outcomes"
lesson_id: "llm-0012"
title: "Reasoning behavior can emerge under outcome training"
description: "Place DeepSeek-R1 as the lecture’s example, not a current model recommendation."
curriculum_home: "/llms.html"
curriculum_title: "How LLMs Work — Karpathy"
prev: "llm-0011-reinforcement-loop.html"
prev_title: "Reinforcement learning rewards successful attempts"
next: "llm-0013-alphago-and-evaluation.html"
next_title: "AlphaGo shows why the scoring environment matters"
knowledge_check: [{"q": "How can outcome training encourage a strategy no labeler explicitly wrote?", "a": "Attempts using useful strategies can receive higher rewards and become more likely through training."}, {"q": "How does this connect to the later computation lesson?", "a": "Additional generated tokens can hold intermediate results that later generation can use."}, {"q": "Why is a long explanation insufficient evidence of success?", "a": "The relevant signal is whether the outcome is correct, not merely the length or appearance of the attempt."}, {"q": "Which parts of this lesson should stay explicitly historical?", "a": "The named model demonstrations and vendor-availability comparisons from February 2025."}]
---

*This lesson zooms into reasoning behavior encouraged by outcome training from the Chapter 3 map. Place it within learning from outcomes in the domain map before reading.*

**Primary video:** [02:27:47–02:42:07](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=8867s). Watch the linked passage alongside this orientation lesson. Historical examples refer to February 2025.

## More than imitating a polished solution

Karpathy uses the DeepSeek-R1 paper to illustrate how reinforcement learning can encourage behaviors that help reach correct answers. He describes longer solution attempts, checking, revisiting an approach, and other reasoning-like patterns that emerge in the examples under outcome optimization. [Source: 02:27:47–02:35:32.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=8867s)

Connect this to the previous lesson: the training signal rewards successful outcomes. It does not require a human to write out every intermediate strategy that could help. The lecture distinguishes the process used to arrive at an answer from the polished presentation delivered to a reader. [Source: 02:15:22–02:17:30; 02:30:00–02:35:32.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=8122s)

## Where computation fits

Longer token sequences give the model additional steps through which to develop intermediate results. That connects outcome training to the later lesson on why generating intermediate tokens can help computation. Length alone is not the outcome criterion: the question remains whether the attempt works. [Source: 02:30:00–02:35:32; 01:48:29–01:55:50.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=9000s)

## Preserve the date boundary

The lecture was published on February 5, 2025. Its comparisons among DeepSeek, OpenAI, Google, and Anthropic describe that period. In particular, statements about which vendors did or did not offer thinking models are historical examples, not current availability claims. [Source: 02:35:32–02:42:07.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=9332s)

The transferable concept is the relationship among a reward signal, generated attempts, and the reasoning strategies that become more likely. You can understand that mechanism without choosing any particular product.
