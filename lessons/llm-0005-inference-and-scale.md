---
layout: "lesson"
chapter: 1
chapter_title: "The token prediction engine"
lesson_id: "llm-0005"
title: "Inference repeatedly selects and appends a token"
description: "Use GPT-2 to distinguish running a model from paying to train it."
curriculum_home: "/llms.html"
curriculum_title: "How LLMs Work — Karpathy"
prev: "llm-0004-training-weights.html"
prev_title: "Training changes weights to improve next-token predictions"
next: "llm-0006-assistant-map.html"
next_title: "The map: an assistant is a trained role"
knowledge_check: [{"q": "Why can repeated runs diverge?", "a": "In the sampling demonstration, different token selections create different contexts for subsequent selections."}, {"q": "Why does appending a token change later predictions?", "a": "That token becomes part of the context used to predict the next one."}, {"q": "Where does GPT-2 fit in the map?", "a": "It is a concrete trained Transformer used to connect the abstract engine to training runs, weights, context limits, and generated outputs."}, {"q": "Why distinguish training cost from generation cost?", "a": "Training changes the artifact through many updates; inference runs an already trained artifact to generate tokens."}]
---

*This lesson zooms into the generation loop and its computational cost from the Chapter 1 map. Place it within the token prediction engine in the domain map before reading.*

**Primary video:** [00:26:01–00:42:52](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1561s). Watch the linked passage alongside this orientation lesson. Historical examples refer to February 2025.

## Generation is a loop

Begin with a prefix. The model predicts a distribution for the next token. Select a token, append it to the prefix, and run the process again. Karpathy uses sampling to explain why different runs can take different paths even when their starting text is identical. A generated continuation can resemble the training distribution without reproducing one particular document. [Source: 00:26:01–00:29:35.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1561s)

```text
Context → probabilities → select token → append → repeat
```

## Training and inference spend computation differently

In the setup described here, training repeatedly updates weights; ordinary inference holds them fixed. A long response means running the generation process over more tokens. It does not by itself mean that the model is learning new weights while talking to you. [Source: 00:29:35–00:31:09.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1775s)

## Why GPT-2 is a useful scale example

Karpathy uses GPT-2 because its main components are recognizable in the later systems discussed in the lecture. Its model size, training data, and context length help make the architecture concrete. He then shows a reproduction project and GPU infrastructure to connect the abstract weight updates to actual computation. [Source: 00:31:09–00:42:52.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1869s)

The reproduction cost and hardware examples are historical demonstrations. Their role here is to show that training requires running many updates over data, while inference uses a trained artifact. They are not a current budget estimate for a new project.

## Carry forward

The next chapter changes the behavior taught to this same prediction machinery. No second conversation-specific intelligence needs to be inserted into the loop. [Source: 00:59:23–01:01:06.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3563s)
