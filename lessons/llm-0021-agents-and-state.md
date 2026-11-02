---
layout: "lesson"
chapter: 5
chapter_title: "Beyond a single text response"
lesson_id: "llm-0021"
title: "Long-running agents expose the problem of state"
description: "More actions over time increase the importance of supervision and limited context."
curriculum_home: "/llms.html"
curriculum_title: "How LLMs Work — Karpathy"
prev: "llm-0020-extensions-map.html"
prev_title: "The map: new media still need a representation"
next: "llm-0022-access-and-integration.html"
next_title: "Separate the model from where you run it"
knowledge_check: [{"q": "Why is a long job different from one answered prompt?", "a": "It requires maintaining a coherent sequence of observations, decisions, and actions over time."}, {"q": "How does the reliability chapter connect to agent supervision?", "a": "Errors in individual outputs can remain relevant during longer workflows, so supervision and checking still matter."}, {"q": "Why is longer context not equivalent to changing weights?", "a": "One supplies more input state for inference; the other changes the parameterized model."}, {"q": "Where does test-time training sit in this source?", "a": "It is raised as a research direction in the speaker’s February 2025 outlook, not specified as a universal current feature."}]
---

*This lesson zooms into state carried through a longer workflow from the Chapter 5 map. Place it within beyond a single text response in the domain map before reading.*

**Primary video:** [03:11:17–03:15:15](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11477s). Watch the linked passage alongside this orientation lesson. Historical examples refer to February 2025.

## From one response to a sequence of actions

Karpathy contrasts solving an individually specified task with organizing a coherent sequence of tasks into a longer job. His agent forecast emphasizes work over time, computer actions, progress reports, and human supervision. [Source: 03:11:17–03:13:13.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11477s)

This connects to the reliability chapter: extending the workflow does not remove the errors that individual responses or actions can contain. In the lecture’s framing, people supervise the work rather than treating a longer autonomous run as a guarantee of correctness. [Source: 03:12:17–03:12:38.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11537s)

## Put persistent work beside finite context

The lecture then returns to fixed weights and a changing context window. In its ordinary inference setup, a model adapts its response to the supplied context without updating parameters during the task. Karpathy flags test-time training as a research direction and argues that very long multimodal tasks will stress the available context. [Source: 03:13:13–03:15:15.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11593s)

```text
Longer job → more observations and actions → more state to carry forward
```

## The distinction to protect

Longer context, stored application state, and changing model weights belong at different places in the system. The source fully motivates the context/weights distinction; it does not specify the memory architecture of every future agent application. Keep its research forecasts separate from implementation claims.

The “so what” is a concrete question: when a workflow continues, what information is being carried into the next step, and where is it carried? That question extends the first chapter’s map rather than replacing it.
