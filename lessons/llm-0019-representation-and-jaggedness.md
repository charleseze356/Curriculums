---
layout: "lesson"
chapter: 4
chapter_title: "Why useful models still fail"
lesson_id: "llm-0019"
title: "Easy for a person can be awkward for token prediction"
description: "Character operations reveal why capabilities do not follow one smooth difficulty ladder."
curriculum_home: "/llms.html"
curriculum_title: "How LLMs Work — Karpathy"
prev: "llm-0018-computation-over-tokens.html"
prev_title: "Intermediate tokens can carry intermediate computation"
next: "llm-0020-extensions-map.html"
next_title: "The map: new media still need a representation"
knowledge_check: [{"q": "Why does this lesson depend on tokenization?", "a": "The model receives text chunks as IDs, while the task may demand direct access to letters inside those chunks."}, {"q": "How is character indexing related to arithmetic tool use?", "a": "Both can be delegated to code that explicitly performs the requested operation."}, {"q": "Why should the strawberry example stay historical?", "a": "The lecture already notes improvement on that specific query; one old failure is not a fixed capability boundary."}, {"q": "What inference does jagged intelligence rule out?", "a": "That success on one difficult-looking task guarantees reliability on every apparently easier task."}]
---

*This lesson zooms into the mismatch between token chunks and character operations from the Chapter 4 map. Place it within why useful models still fail in the domain map before reading.*

**Primary video:** [02:01:11–02:07:28](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=7271s). Watch the linked passage alongside this orientation lesson. Historical examples refer to February 2025.

## Return to the tokenizer

The lecture’s spelling examples revisit the representation introduced in Chapter 1. A word can arrive as several token chunks, while the task asks for individual characters. To perform the operation, the model must connect those chunk identities to their internal spelling and then manipulate the letters. [Source: 02:01:11–02:03:07.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=7271s)

Karpathy asks for every third character of a word, then demonstrates using code for the operation. Code supplies a tool suited to explicit character indexing. This parallels the arithmetic lesson: a deterministic operation can be delegated rather than attempted only through generated text. [Source: 02:01:45–02:03:44.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=7305s)

## The limits of the example

Counting letters in “strawberry” is used as a historical illustration, and the lecture itself notes that the specific answer had improved. It is not a permanent test that every future model must fail. The durable point is the mismatch between token representation and some character-level requests. [Source: 02:03:44–02:04:53.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=7424s)

## Place jagged intelligence here

The decimal-comparison example broadens the warning: advanced performance and elementary mistakes can coexist. The lecture does not fully establish the cause of every such failure. Resist replacing one smooth human difficulty ladder with another oversimplified model story. [Source: 02:04:53–02:07:28.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=7493s)

When an answer matters, evaluate the actual task and result. Success on an impressive different task cannot substitute for that check. [Source: 03:08:52–03:09:39.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11332s)
