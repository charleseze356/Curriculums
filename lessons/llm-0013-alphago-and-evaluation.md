---
layout: "lesson"
chapter: 3
chapter_title: "Learning from outcomes"
lesson_id: "llm-0013"
title: "AlphaGo shows why the scoring environment matters"
description: "A closed game provides a clearer outcome signal than many open-ended tasks."
curriculum_home: "/llms.html"
curriculum_title: "How LLMs Work — Karpathy"
prev: "llm-0012-reasoning-models.html"
prev_title: "Reasoning behavior can emerge under outcome training"
next: "llm-0014-rlhf-proxy.html"
next_title: "RLHF optimizes a learned proxy for human preference"
knowledge_check: [{"q": "What relationship is shared by AlphaGo and the lecture’s LLM RL loop?", "a": "Generated attempts are evaluated by outcomes, and training favors behavior associated with better outcomes."}, {"q": "Why is Go useful as an example of verification?", "a": "Its explicit rules and game outcomes supply a clear scoring environment."}, {"q": "Why does the analogy not solve open-ended language evaluation?", "a": "A broad range of language tasks lacks one equally simple universal outcome check."}, {"q": "How does this prepare you for RLHF?", "a": "It highlights why subjective tasks may need a preference scorer instead of a direct correctness or win/loss signal."}]
---

*This lesson zooms into the scoring environment behind outcome learning from the Chapter 3 map. Place it within learning from outcomes in the domain map before reading.*

**Primary video:** [02:42:07–02:48:26](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=9727s). Watch the linked passage alongside this orientation lesson. Historical examples refer to February 2025.

## One mechanism, a different environment

Karpathy uses AlphaGo to connect LLM reinforcement learning to an earlier example of learning from outcomes. Imitation uses expert games as demonstrations. Reinforcement learning uses played games and their results to favor behavior that wins. [Source: 02:42:07–02:44:30.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=9727s)

The load-bearing similarity is **attempt → outcome → improvement**. The important difference is the environment: Go supplies explicit rules and an outcome that can be evaluated. Broad language tasks require many different prompt types and ways of checking performance. [Source: 02:44:30–02:48:26; 03:05:03–03:06:30.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=9870s)

## Why this comes after the RL loop

The game analogy makes exploration easier to place. Instead of copying only known expert moves, the system can favor moves because of their consequences in games. Karpathy uses this to motivate the possibility of strategies that exceed the demonstrations. Treat this as his explanation of the comparison, not a theorem that any RL system must surpass any human. [Source: 02:43:10–02:46:30.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=9790s)

## What does not transfer automatically

A scoring environment for Go is not an answer key for every real-world question. The lecture points toward the challenge of constructing diverse practice environments for general reasoning. The next lesson makes the problem sharper: for a poem or joke, an evaluator may itself be a learned model of human preference. [Source: 02:47:30–02:49:40.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10050s)

Before leaving this lesson, identify the evaluator in both cases. The quality of that feedback is the bridge to RLHF.
