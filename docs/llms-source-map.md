---
layout: default
title: "How LLMs Work — source coverage"
---

[Return to the LLM roadmap](../llms.html)

# Source coverage and scope

**Primary source:** [Andrej Karpathy, Deep Dive into LLMs like ChatGPT](https://www.youtube.com/watch?v=7xTGNNLPyMI), published February 5, 2025, approximately 3 hours 31 minutes.

**Scope substitution:** No separate syllabus was supplied. The video’s own 24 chapter headings are the completeness checklist, and its spoken content is the primary source. This is a complete orientation map of this video, not a complete technical LLM engineering course.

**Audience:** Someone who uses LLMs and wants the mechanics from scratch. No coding assignments, flashcards, or automated tutoring are bundled into the site. The four checks per lesson ask about placement and connections. Reading or checking off lessons does not establish mastery.

**Source retrieval:** English auto-generated captions were downloaded directly from YouTube and retrieved successfully through the user-selected vidIQ plugin on November 1, 2026. A public transcript mirror was used during the initial authentication failure; source links resolve to the primary video. Caption errors are possible. Exact chapter starts were checked against the video’s description. The curriculum paraphrases the content and does not redistribute the transcript.

**Date boundary:** Model offerings, prices, rankings, historical failures, and vendor comparisons are February 2025 examples. Forecasts are labeled as the speaker’s outlook. The site does not claim those are current November 2026 facts.

**Evidence boundaries:** The weights/context distinction and the training-stage framework organize the lessons. Proposed explanations are identified as such. In particular, the decimal/Bible-verse anecdote is not treated as established evidence, the possible uncertainty-feature story is not a universal mechanism, and the AlphaGo analogy is not a theorem about all RL. Modern memory systems, detailed Transformer mathematics, deployment setup, and current model recommendations are not sourced by this one lecture and are not silently added.

**Pedagogy:** The dependency order and placement prompts are editorial organization using the requested Sung lens. The page is not authored or endorsed by Justin Sung or Andrej Karpathy. Chapters start with maps; lower-level examples follow their prerequisite concepts.

## Completeness reconciliation

Every source chapter appears below. Repeated synthesis maps to the overview and closing lesson rather than duplicating the full course.

| Video start | Original chapter | Curriculum placement |
|---|---|---|
| [00:00:00](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=0s) | introduction | [llm-0001](../lessons/llm-0001-engine-map.html) |
| [00:01:00](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=60s) | pretraining data (internet) | [llm-0002](../lessons/llm-0002-data-selection.html) |
| [00:07:47](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=467s) | tokenization | [llm-0003](../lessons/llm-0003-token-representation.html) |
| [00:14:27](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=867s) | neural network I/O | [llm-0004](../lessons/llm-0004-training-weights.html) |
| [00:20:11](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1211s) | neural network internals | [llm-0004](../lessons/llm-0004-training-weights.html) |
| [00:26:01](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1561s) | inference | [llm-0005](../lessons/llm-0005-inference-and-scale.html) |
| [00:31:09](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=1869s) | GPT-2: training and inference | [llm-0005](../lessons/llm-0005-inference-and-scale.html) |
| [00:42:52](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=2572s) | Llama 3.1 base model inference | [llm-0007](../lessons/llm-0007-base-models.html) |
| [00:59:23](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3563s) | pretraining to post-training | [llm-0006](../lessons/llm-0006-assistant-map.html) |
| [01:01:06](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=3666s) | post-training data (conversations) | [llm-0008](../lessons/llm-0008-conversation-protocol.html), [llm-0009](../lessons/llm-0009-supervised-imitation.html) |
| [01:20:32](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=4832s) | hallucinations, tool use, knowledge/working memory | [llm-0015](../lessons/llm-0015-reliability-map.html), [llm-0016](../lessons/llm-0016-grounding-and-tools.html) |
| [01:41:46](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=6106s) | knowledge of self | [llm-0017](../lessons/llm-0017-self-description.html) |
| [01:46:56](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=6416s) | models need tokens to think | [llm-0018](../lessons/llm-0018-computation-over-tokens.html) |
| [02:01:11](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=7271s) | tokenization revisited: models struggle with spelling | [llm-0019](../lessons/llm-0019-representation-and-jaggedness.html) |
| [02:04:53](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=7493s) | jagged intelligence | [llm-0015](../lessons/llm-0015-reliability-map.html), [llm-0019](../lessons/llm-0019-representation-and-jaggedness.html) |
| [02:07:28](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=7648s) | supervised finetuning to reinforcement learning | [llm-0010](../lessons/llm-0010-outcome-learning-map.html) |
| [02:14:42](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=8082s) | reinforcement learning | [llm-0011](../lessons/llm-0011-reinforcement-loop.html) |
| [02:27:47](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=8867s) | DeepSeek-R1 | [llm-0012](../lessons/llm-0012-reasoning-models.html) |
| [02:42:07](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=9727s) | AlphaGo | [llm-0013](../lessons/llm-0013-alphago-and-evaluation.html) |
| [02:48:26](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=10106s) | reinforcement learning from human feedback (RLHF) | [llm-0014](../lessons/llm-0014-rlhf-proxy.html) |
| [03:09:39](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11379s) | preview of things to come | [llm-0020](../lessons/llm-0020-extensions-map.html), [llm-0021](../lessons/llm-0021-agents-and-state.html) |
| [03:15:15](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11715s) | keeping track of LLMs | [llm-0022](../lessons/llm-0022-access-and-integration.html) |
| [03:18:34](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=11914s) | where to find LLMs | [llm-0022](../lessons/llm-0022-access-and-integration.html) |
| [03:21:46](https://www.youtube.com/watch?v=7xTGNNLPyMI&t=12106s) | grand summary | [llm-0001](../lessons/llm-0001-engine-map.html), [llm-0022](../lessons/llm-0022-access-and-integration.html) |

**Coverage:** 24/24 source chapters placed across 22 lessons; no video chapter omitted. This count does not claim that every sentence or demonstration was reproduced.

## Educational use

The original YouTube description states that the video is freely available for educational and internal training use, including lessons and courses, subject to its listed restrictions. These lessons are original orientation notes with attribution and links to the original. The video remains the teaching resource.

## Source record

- Video ID: `7xTGNNLPyMI`
- vidIQ English caption text SHA-256: `41bd1657123290fdbd2cb732cfd18f77c10f475a95e377959bffd808c0b8aec9`
- Transcript fetch: successful after reauthentication; returned usage: 5 credits.
- Full transcript retained in the task’s private working files, not published here.
