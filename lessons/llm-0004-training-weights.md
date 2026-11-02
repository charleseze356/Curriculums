---
layout: "lesson"
chapter: 1
chapter_title: "The token prediction engine"
lesson_id: "llm-0004"
title: "Training changes weights to improve next-token predictions"
description: "The Transformer is the function; training finds useful parameter settings."
curriculum_home: "/llms.html"
curriculum_title: "How LLMs Work — Karpathy"
prev: "llm-0003-token-representation.html"
prev_title: "Tokens are the model’s units of text"
next: "llm-0005-inference-and-scale.html"
next_title: "Inference repeatedly selects and appends a token"
knowledge_check: [{"q": "What connects a training example to a weight update?", "a": "The difference between the predicted next-token distribution and the observed continuation supplies the training signal."}, {"q": "Where does the Transformer sit?", "a": "It is the parameterized computation that transforms token context into next-token predictions."}, {"q": "Why can the same weights produce different answers?", "a": "The output also depends on the input context; a shared function can respond differently to different token sequences."}, {"q": "What breaks if you equate changing context with training?", "a": "You lose the distinction between supplying information to an existing model and changing the model’s parameters."}]
---

*This lesson zooms into weight updates and the Transformer function from the Chapter 1 map. Place it within the token prediction engine in the domain map before reading.*

**Primary video:** [00:14:27–00:26:01](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=867s). Watch the linked passage alongside this orientation lesson. Historical examples refer to February 2025.

## Separate the function from the update

A context is a sequence of preceding tokens. Given that context, the network produces a probability distribution over possible next tokens. During training, the dataset supplies the token that actually followed. The training process adjusts the weights to make that observed continuation more likely. This happens across many contexts and token positions. [Source: 00:15:17–00:20:11.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=917s)

```text
Context + current weights → predicted probabilities
                                  ↓ compare with observed next token
                            update the weights
```

Karpathy describes weights as adjustable knobs. Random initial settings give poor predictions. Repeated updates find settings that better match patterns in the training data. That explains how one shared set of weights can support many different contexts. [Source: 00:20:11–00:21:58.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1211s)

## Place the Transformer inside the box

The visualization shows token embeddings followed by mathematical transformations, including attention and multilayer perceptron blocks, leading to next-token predictions. At this orientation level, the important point is that these are computations with parameters. You are not being asked to derive attention or backpropagation; this lecture does not provide that full technical course. [Source: 00:23:04–00:26:01.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1384s)

## Why this matters later

Changing weights is a training operation. Providing different context changes the function’s input. Both can change an answer, but they operate at different places in the map. Keep that distinction intact when comparing fine-tuning, prompting, and tool results. [Source: 00:26:01–00:31:09.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1561s)
