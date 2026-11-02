---
layout: "lesson"
chapter: 4
chapter_title: "Why useful models still fail"
lesson_id: "llm-0018"
title: "Intermediate tokens can carry intermediate computation"
description: "A correct-looking explanation is still different from an independently checked calculation."
curriculum_home: "/llms.html"
curriculum_title: "How LLMs Work — Karpathy"
prev: "llm-0017-self-description.html"
prev_title: "A model’s self-description is generated output"
next: "llm-0019-representation-and-jaggedness.html"
next_title: "Easy for a person can be awkward for token prediction"
knowledge_check: [{"q": "How can intermediate tokens help the final answer?", "a": "They can hold intermediate results that later generation can use instead of demanding all computation before one immediate answer token."}, {"q": "Why does more text not guarantee more accurate reasoning?", "a": "Intermediate steps can also be wrong; length is not an independent verification signal."}, {"q": "Where does code change the mechanism?", "a": "An external interpreter performs arithmetic, then returns its output to the conversation context."}, {"q": "How does this connect to outcome-based training?", "a": "Training can encourage generated strategies that reach correct outcomes, including useful intermediate solution behavior."}]
---

*This lesson zooms into computation distributed over generated tokens from the Chapter 4 map. Place it within why useful models still fail in the domain map before reading.*

**Primary video:** [01:46:56–02:01:11](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=6416s). Watch the linked passage alongside this orientation lesson. Historical examples refer to February 2025.

## One next-token step has limited computation

Karpathy contrasts an answer-first response with one that builds intermediate results before emitting the final answer. His point is computational: each generated token is produced through a finite network computation. More generated steps can make intermediate results available in context before the final answer is produced. [Source: 01:48:29–01:53:27.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=6509s)

```text
Problem → intermediate result → another result → final answer
```

The lecture’s fruit-price demonstration increases the arithmetic burden and compares immediate-answer behavior with a response that works through intermediate calculations. Use it to connect generation length to computation, rather than assuming every long answer is better. [Source: 01:53:27–01:55:50.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=6807s)

## A distinct solution: delegate arithmetic

Karpathy then asks the system to use code. The model writes a program, an interpreter performs the calculation, and the result returns to the conversation. This moves the exact arithmetic to a different tool rather than relying only on token prediction to simulate it. [Source: 01:55:50–02:01:11.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=6950s)

## The “so what”

Separate three questions: did the response have room to compute, did it use a suitable tool, and was the result checked? Intermediate prose is not a correctness certificate. The lecture itself warns that any intermediate arithmetic step may fail. [Source: 01:55:50–01:56:42.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=6950s)

For learning, the link to Chapter 3 is that training can encourage useful solution behavior. For use, the link to the grounding lesson is that a tool’s result becomes new information available to later generation.
