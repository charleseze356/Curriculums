---
layout: "lesson"
chapter: 3
chapter_title: "Learning from outcomes"
lesson_id: "llm-0014"
title: "RLHF optimizes a learned proxy for human preference"
description: "The reward model enables scale but introduces a gap between score and quality."
curriculum_home: "/llms.html"
curriculum_title: "How LLMs Work — Karpathy"
prev: "llm-0013-alphago-and-evaluation.html"
prev_title: "AlphaGo shows why the scoring environment matters"
next: "llm-0015-reliability-map.html"
next_title: "The map: diagnose the source of a failure"
knowledge_check: [{"q": "Where does human feedback enter the depicted pipeline?", "a": "People rank candidate responses, providing supervision for a reward model."}, {"q": "Why must the assistant and reward model be distinguished?", "a": "One generates responses; the other scores them, and optimization uses those scores as feedback."}, {"q": "What breaks when a proxy score becomes the whole objective?", "a": "Optimization can exploit scorer weaknesses, producing high scores without the intended human-valued quality."}, {"q": "Why does preference improvement not guarantee factual correctness?", "a": "Human preference scores and directly verified factual outcomes are different evaluation targets."}]
---

*This lesson zooms into learned preference scores as a training signal from the Chapter 3 map. Place it within learning from outcomes in the domain map before reading.*

**Primary video:** [02:48:26–03:09:39](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10106s). Watch the linked passage alongside this orientation lesson. Historical examples refer to February 2025.

## Replace an answer key with preference judgments

A joke or poem lacks the simple numeric answer key used in the math example. Karpathy describes humans ranking candidate responses, then training a separate reward model to produce scores consistent with those rankings. The assistant can subsequently be optimized against that scorer. [Source: 02:48:26–02:57:51.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10106s)

```text
Human rankings → train reward model
                           ↓ scores attempts
                    train assistant with RL
```

Keep the two models separate. The assistant generates a response; the reward model scores a prompt-response pair. A learned score is an approximation of preference, not a human judgment freshly obtained for every generated response. [Source: 02:54:28–02:57:51.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10468s)

## Why the proxy can help and fail

Ranking alternatives may be easier for a person than writing an ideal response from scratch. Karpathy presents this as his explanation for an observed benefit, rather than a settled account of every RLHF improvement. [Source: 02:58:25–03:00:32.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10705s)

Optimization can also discover responses that the reward model scores highly even though people would find them poor. His repeated-word joke is a cartoon of this mismatch. The problem is the gap between the score being optimized and the quality it is meant to represent. [Source: 03:00:54–03:04:33.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10854s)

## Carry the distinction forward

A polished, preferred response and a verified fact are different targets. The lecture’s closing advice is to use these systems as tools and check their work. Its broad claims about how far particular RL methods can scale should be read as the speaker’s February 2025 account, rather than timeless limits. [Source: 03:05:03–03:09:39.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11103s)
