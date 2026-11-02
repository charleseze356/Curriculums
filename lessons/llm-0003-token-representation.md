---
layout: "lesson"
chapter: 1
chapter_title: "The token prediction engine"
lesson_id: "llm-0003"
title: "Tokens are the model’s units of text"
description: "Representation trades a larger vocabulary for shorter sequences."
curriculum_home: "/llms.html"
curriculum_title: "How LLMs Work — Karpathy"
prev: "llm-0002-data-selection.html"
prev_title: "Data selection determines what the model gets to learn from"
next: "llm-0004-training-weights.html"
next_title: "Training changes weights to improve next-token predictions"
knowledge_check: [{"q": "Where does tokenization connect data selection to training?", "a": "It turns the selected text into the finite-vocabulary symbol sequence the network consumes."}, {"q": "Why combine characters or bytes into larger chunks?", "a": "The lecture frames this as trading a larger vocabulary for shorter sequences and more manageable computation."}, {"q": "Why does “next word prediction” obscure part of the mechanism?", "a": "The predicted unit is a token, which may be only part of a word or may include other text."}, {"q": "How does this lesson prepare you for spelling failures?", "a": "Character-level questions require recovering letters inside token chunks rather than directly inspecting the text as a person does."}]
---

*This lesson zooms into token representation from the Chapter 1 map. Place it within the token prediction engine in the domain map before reading.*

**Primary video:** [00:07:47–00:14:27](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=467s). Watch the linked passage alongside this orientation lesson. Historical examples refer to February 2025.

## A word on the screen is not necessarily one model input

The network needs a sequence of symbols drawn from a finite vocabulary. Karpathy works from bits to bytes to larger chunks to show the tradeoff: very small symbols produce long sequences, while combining common chunks creates more possible symbols and shorter sequences. Sequence length is a valuable computational resource. [Source: 00:07:47–00:11:55.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=467s)

Tokens can correspond to pieces of words, words, spaces, punctuation, or other text chunks. Their numerical IDs identify vocabulary entries; the numbers themselves do not encode an ordering of meanings. [Source: 00:12:00–00:14:27; 00:14:28.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=720s)

```text
Visible text → tokenizer → token IDs → neural network
```

## Why this comes before the network

When the next lesson says “predict the next token,” it means predict one of these vocabulary entries. It does not necessarily mean predict a whole word or a single letter. The output distribution has one possible outcome for each vocabulary entry. [Source: 00:14:27–00:18:35.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=867s)

Karpathy’s tokenizer demonstration changes capitalization and spaces to show that apparently small text edits can change the token sequence. Treat his exact vocabulary size as a detail of the demonstrated tokenizer. [Source: 00:12:13–00:14:27.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=733s)

## The later connection

Return here when you reach spelling failures. A person can visually inspect every letter in a word; the model initially receives chunk IDs. That representation helps explain why some character operations are awkward for it. [Source: 02:01:11–02:04:53.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=7271s)
