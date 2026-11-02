---
layout: "lesson"
chapter: 3
chapter_title: "Learning from outcomes"
lesson_id: "llm-0011"
title: "Reinforcement learning rewards successful attempts"
description: "Generation supplies candidate solutions; outcome feedback changes later behavior."
curriculum_home: "/llms.html"
curriculum_title: "How LLMs Work — Karpathy"
prev: "llm-0010-outcome-learning-map.html"
prev_title: "The map: imitation and outcome feedback teach differently"
next: "llm-0012-reasoning-models.html"
next_title: "Reasoning behavior can emerge under outcome training"
knowledge_check: [{"q": "How does sampling connect inference to RL training?", "a": "Sampling produces candidate token-sequence attempts whose outcomes can then supply feedback for updates."}, {"q": "Why is generating many answers alone not RL training?", "a": "Generation uses the current model; RL training also uses feedback to update its behavior."}, {"q": "What does a known final answer supply without supplying a worked solution?", "a": "A way to evaluate whether an independently generated attempt reached the target."}, {"q": "Why does the quality of the evaluator matter?", "a": "The model is encouraged toward whatever the evaluator rewards, so unreliable scoring can encourage the wrong behavior."}]
---

*This lesson zooms into the relationship between attempts, scores, and updates from the Chapter 3 map. Place it within learning from outcomes in the domain map before reading.*

**Primary video:** [02:14:42–02:27:47](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=8082s). Watch the linked passage alongside this orientation lesson. Historical examples refer to February 2025.

## The unit to track is an attempted solution

Karpathy begins with a simple fruit-price problem. There are several ways to reach the same correct result. A human labeler choosing one elegant solution for SFT is making a different decision from an RL process scoring the model’s own attempts for success. [Source: 02:14:42–02:17:30.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=8082s)

```text
Prompt → generate several attempts → score outcomes
                                         ↓
                             update response tendencies
                                         ↓
                                generate new attempts
```

The lecture’s cartoon uses successful and unsuccessful rollouts to show the core idea. Training encourages behavior associated with correct outcomes. This is an orientation model of RL, not a full specification of an optimization algorithm; the lecture later emphasizes that the implementation details matter. [Source: 02:20:00–02:24:30; 02:28:11.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=8400s)

## Why the earlier engine matters

The candidate attempts are still generated as token sequences. Sampling allows different routes. Updating the model changes which routes it is more likely to produce later. Generating many attempts without an update is therefore not the same operation as training on feedback. [Source: 02:20:00–02:27:47.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=8400s)

## Why verification is load-bearing

The prompt and answer key do not supply a complete solution path. They let the system explore possible paths and reward those that reach the target. If that target can be checked reliably, the feedback is more direct than a subjective impression that a response sounds good. [Source: 02:13:00–02:14:42; 02:48:26–02:49:16.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=7980s)
