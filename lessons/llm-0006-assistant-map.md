---
layout: "lesson"
chapter: 2
chapter_title: "From base model to assistant"
lesson_id: "llm-0006"
title: "The map: an assistant is a trained role"
description: "Pretraining supplies broad patterns; conversation training shapes how the model responds."
curriculum_home: "/llms.html"
curriculum_title: "How LLMs Work — Karpathy"
prev: "llm-0005-inference-and-scale.html"
prev_title: "Inference repeatedly selects and appends a token"
next: "llm-0007-base-models.html"
next_title: "A base model continues a document"
knowledge_check: [{"q": "Where does supervised fine-tuning attach to the pipeline?", "a": "It continues training from a base model using curated conversation examples."}, {"q": "Why can next-token prediction support conversation?", "a": "A conversation can be encoded as a token sequence whose continuation is an assistant response."}, {"q": "How do protocol and examples differ?", "a": "The protocol represents message structure and roles; the examples demonstrate what responses should follow."}, {"q": "Why should assistant style be separated from factual reliability?", "a": "Training can teach confident helpful responses without guaranteeing that the model has accurate knowledge for every new question."}]
---

*This is the map lesson for From base model to assistant. Every subsequent lesson in this chapter hangs off the framework established here.*

**Primary video:** [00:59:23–01:05:01](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3563s) · [02:07:28–02:10:59](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=7648s). Watch the linked passage alongside this orientation lesson. Historical examples refer to February 2025.

## Place the change at the training data

The base model learned to continue text. An assistant needs a more specific behavior: respond to a user in a useful conversation, including appropriate refusals. Karpathy introduces post-training as the stage that shapes this behavior after pretraining. [Source: 00:59:23–01:02:23.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3563s)

```text
Pretraining on documents → base model
Base model + conversation examples → supervised fine-tuned assistant
```

The key continuity is that conversations can also be encoded as token sequences. This lets the same general next-token learning framework operate on a different kind of material. The change in dataset can produce a large change in observed behavior. [Source: 01:05:01–01:09:52; 02:08:07.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3901s)

## Three details to attach here

The next lessons separate the **base model’s behavior**, the **conversation protocol**, and the **examples used for supervised fine-tuning**. These are connected but different. A protocol represents who said what; examples teach which responses should follow. A base model may also imitate a conversation placed in its prompt, which is useful for understanding why an assistant role can be elicited at all. [Source: 00:54:00–00:59:23; 01:05:01–01:12:16.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3240s)

## The “so what”

An assistant’s confident, helpful style comes from training examples and instructions. That style is not independent evidence that its factual content is correct. Keep this link in mind before the reliability chapter. [Source: 01:20:32–01:24:00.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=4832s)
