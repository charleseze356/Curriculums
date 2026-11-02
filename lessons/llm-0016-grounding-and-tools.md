---
layout: "lesson"
chapter: 4
chapter_title: "Why useful models still fail"
lesson_id: "llm-0016"
title: "Grounding puts the source into the current context"
description: "Separate learned recollection from information supplied for this answer."
curriculum_home: "/llms.html"
curriculum_title: "How LLMs Work — Karpathy"
prev: "llm-0015-reliability-map.html"
prev_title: "The map: diagnose the source of a failure"
next: "llm-0017-self-description.html"
next_title: "A model’s self-description is generated output"
knowledge_check: [{"q": "How can a model produce a confident but unsupported biography?", "a": "It can continue a learned confident-answer pattern even for a name whose facts it does not reliably know."}, {"q": "Where does a search result enter the model?", "a": "It is added to the current context for later token generation."}, {"q": "Why can pasting a passage help without retraining?", "a": "The model can condition on the exact text instead of reconstructing it from learned parameters."}, {"q": "What distinction is lost if tool use is called a knowledge update without qualification?", "a": "It obscures the difference between new context in this interaction and a change to learned weights."}]
---

*This lesson zooms into the information available to support a factual answer from the Chapter 4 map. Place it within why useful models still fail in the domain map before reading.*

**Primary video:** [01:20:32–01:41:46](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=4832s). Watch the linked passage alongside this orientation lesson. Historical examples refer to February 2025.

## Confidence can be a learned style

Karpathy’s hallucination example starts with confidently answered biography questions in training. A new unfamiliar name can elicit the same answer pattern even when the model lacks dependable knowledge. This connects SFT’s desired response style to a failure of factual support. [Source: 01:20:32–01:24:00.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=4832s)

He describes training examples that allow the model to acknowledge uncertainty as one mitigation. His discussion of a possible internal uncertainty feature is a proposed account; it should not be taken as a precisely identified universal mechanism. [Source: 01:24:00–01:32:16.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=5040s)

## Two places information can come from

The lecture distinguishes learned information in parameters from text available in the current context. Karpathy’s “recollection” and “working memory” language is an analogy for this difference. Searching for information and inserting the result supplies context; it does not require changing the weights. [Source: 01:32:38–01:39:30.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=5558s)

```text
Question → generate search request → external result → add to context
                                                         ↓
                                                 generate answer
```

## Why supplying the document helps

For a task about an exact passage, Karpathy recommends including the passage rather than relying on its reconstruction from parameters. His book-chapter example makes this concrete: the source is directly available to condition the response. The practical improvement is stronger access to the relevant material, not a guarantee that every resulting statement is correct. [Source: 01:39:00–01:41:46.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=5940s)

Place a tool result in the same category as a pasted document: information supplied to the ongoing generation process. This is the main bridge from the core engine to tool-assisted factual work.
