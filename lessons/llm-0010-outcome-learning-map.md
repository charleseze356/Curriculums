---
layout: "lesson"
chapter: 3
chapter_title: "Learning from outcomes"
lesson_id: "llm-0010"
title: "The map: imitation and outcome feedback teach differently"
description: "Use the textbook analogy to place pretraining, SFT, and reinforcement learning."
curriculum_home: "/llms.html"
curriculum_title: "How LLMs Work — Karpathy"
prev: "llm-0009-supervised-imitation.html"
prev_title: "Supervised fine-tuning teaches by example"
next: "llm-0011-reinforcement-loop.html"
next_title: "Reinforcement learning rewards successful attempts"
knowledge_check: [{"q": "Why is a worked solution different from an answer key?", "a": "A worked solution supplies a behavior to imitate; an answer key lets the learner evaluate its own attempted route."}, {"q": "Where does the evaluator enter the RL map?", "a": "It supplies the score used to encourage or discourage generated behaviors during training."}, {"q": "Why does math precede joke preference in this explanation?", "a": "A known math answer makes the scoring relationship easier to see before introducing a learned quality proxy."}, {"q": "What should you preserve from the textbook analogy?", "a": "The distinction among background text, demonstrated solutions, and feedback on attempts—not a literal equivalence to human learning."}]
---

*This is the map lesson for Learning from outcomes. Every subsequent lesson in this chapter hangs off the framework established here.*

**Primary video:** [02:07:28–02:14:42](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=7648s). Watch the linked passage alongside this orientation lesson. Historical examples refer to February 2025.

## Three training signals

Karpathy uses a textbook analogy to distinguish stages. Reading exposition resembles building background knowledge in pretraining. Studying worked examples resembles supervised fine-tuning. Attempting practice problems with an answer key resembles reinforcement learning. The analogy organizes the kinds of training information; it does not imply that neural networks learn exactly as human students do. [Source: 02:11:18–02:14:42.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=7878s)

| Stage | Information supplied | Relationship to learn |
|---|---|---|
| Pretraining | Large collections of text | Patterns in continuations |
| SFT | Desired conversation responses | How an assistant should respond |
| RL | Attempts and an outcome/reward signal | Which generated behaviors lead to rewarded outcomes |

The table is an orientation synthesis of the lecture’s analogy. [Source: 02:07:28–02:14:42.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=7648s)

## Put the evaluator in the map

Once the model generates attempts, something must score them. A math answer may be checked against a known result. A joke’s quality does not have an equally simple answer key. This difference determines why the later RLHF lesson needs a learned preference scorer. [Source: 02:14:42–02:23:30; 02:48:26–02:50:09.](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=8082s)

## The dependency through this chapter

First understand the loop of generating, scoring, and updating. Then place the reasoning-model examples and AlphaGo comparison. Finally inspect what can go wrong when the evaluator is an imperfect learned proxy. Keep the quality of the feedback signal in view throughout.
