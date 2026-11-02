---
layout: "lesson"
chapter: 4
chapter_title: "Why useful models still fail"
lesson_id: "llm-0015"
title: "The map: diagnose the source of a failure"
description: "Availability of facts, self-description, computation, and representation are separate questions."
curriculum_home: "/llms.html"
curriculum_title: "How LLMs Work — Karpathy"
prev: "llm-0014-rlhf-proxy.html"
prev_title: "RLHF optimizes a learned proxy for human preference"
next: "llm-0016-grounding-and-tools.html"
next_title: "Grounding puts the source into the current context"
knowledge_check: [{"q": "Why is “it solved a harder problem” a weak reliability argument?", "a": "Capabilities are uneven; apparent human difficulty does not establish reliability for every other task."}, {"q": "Where should you place a spelling error before diagnosing it?", "a": "At the relationship between token representation and the requested character-level operation."}, {"q": "Why do these lessons depend on the training map?", "a": "Training examples, context, and computation provide distinct mechanisms that can contribute to observed failures."}, {"q": "How should the Bible-verse explanation be treated?", "a": "As a tentative anecdote explicitly qualified by the speaker, not an established causal fact."}]
---

*This is the map lesson for Why useful models still fail. Every subsequent lesson in this chapter hangs off the framework established here.*

**Primary video:** [01:20:32–01:23:30](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=4832s) · [01:41:46–01:48:29](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=6106s) · [02:01:11–02:07:28](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=7271s) · [03:07:00–03:09:39](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11220s). Watch the linked passage alongside this orientation lesson. Historical examples refer to February 2025.

## Put reliability back into the mechanism

Karpathy’s “jagged intelligence” examples show why strength on one difficult-looking task does not establish reliability on every simple-looking task. The useful question is which part of the mechanism a task stresses. [Source: 02:04:53–02:07:28; 03:08:52.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=7493s)

| Failure to investigate | Connection in the map |
|---|---|
| Unsupported factual answer | Learned response style and uncertain recollection |
| Incorrect identity claim | Training examples or supplied identity context |
| Arithmetic mistake | Computation spread across token generation or delegated to code |
| Character manipulation error | Token chunks differ from directly visible letters |

These branches organize the demonstrations that follow. [Source: 01:20:32–01:46:56; 01:46:56–02:07:28.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=4832s)

## Why these are taught after training

Without the earlier chapters, failures look like unrelated oddities. With the engine and training signals in view, several connect to specific design choices: what was represented, what was demonstrated, what information is present, and how much computation has occurred. The lecture also explicitly acknowledges examples whose precise explanation is uncertain. [Source: 02:01:11–02:07:28.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=7271s)

## Use mechanisms without overclaiming them

Karpathy mentions a proposed explanation involving Bible-verse associations for a decimal-comparison failure, while saying he had not read the paper. This curriculum does not promote that anecdote into an established causal result. Keep the demonstrated lesson—capability is uneven—and mark the proposed explanation as uncertain. [Source: 02:06:03–02:07:28.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=7563s)

The following lessons turn each branch into a better question to ask of a model’s output.
