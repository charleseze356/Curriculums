---
layout: "lesson"
chapter: 1
chapter_title: "The token prediction engine"
lesson_id: "llm-0002"
title: "Data selection determines what the model gets to learn from"
description: "Pretraining starts with a curated sample of the internet, not an untouched copy of everything."
curriculum_home: "/llms.html"
curriculum_title: "How LLMs Work — Karpathy"
prev: "llm-0001-engine-map.html"
prev_title: "The map: training builds the engine; inference runs it"
next: "llm-0003-token-representation.html"
next_title: "Tokens are the model’s units of text"
knowledge_check: [{"q": "Where does filtering sit relative to tokenization?", "a": "It selects and extracts the text before that text is represented as token sequences."}, {"q": "Why can language filtering affect later capabilities?", "a": "It changes which language examples are available for training."}, {"q": "Why is “the model learned the internet” an incomplete description?", "a": "The model trains on selected, processed material, and that material is only the input to a statistical learning process."}, {"q": "What matters more for this map than remembering FineWeb’s exact size?", "a": "Understanding that corpus selection shapes the examples whose next-token patterns the network is trained to predict."}]
---

*This lesson zooms into corpus curation from the Chapter 1 map. Place it within the token prediction engine in the domain map before reading.*

**Primary video:** [00:01:00–00:07:47](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=60s). Watch the linked passage alongside this orientation lesson. Historical examples refer to February 2025.

## Curation comes before prediction

Karpathy uses FineWeb to make pretraining data concrete. The aim is a large, varied collection of useful text. Starting with web crawls still leaves a processing problem: a web page contains navigation, markup, duplicated content, and material the dataset builder may exclude. [Source: 00:01:00–00:04:48.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=60s)

His sequence includes URL filtering, text extraction, language filtering, deduplication, and removal of some personally identifiable information. Each step changes which examples reach training. Language filtering is especially easy to place: excluding a language changes the text patterns available for the model to learn. [Source: 00:03:26–00:06:46.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=206s)

```text
Web crawl → filtering and extraction → curated text → tokenization
```

## Why this is load-bearing

Later, the training objective rewards predicting the next token in this selected material. The network therefore learns from the corpus it actually receives. It does not get an independent guarantee that every useful topic, language, or fact has been represented well. Karpathy returns to this unevenness when discussing a base model’s recollection of common versus rare information. [Source: 00:07:01–00:07:47; 00:50:00–00:52:02.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=421s)

## Keep scale in its place

The lecture’s FineWeb figures—roughly 44 TB and 15 trillion tokens—are one historical example, not a specification for every LLM. The important relationship is that filtering happens before training, and that text storage size and token count describe different representations of the same corpus. [Source: 00:02:08; 00:14:28.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=128s)
