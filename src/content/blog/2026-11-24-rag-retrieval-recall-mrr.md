---
title: "Measuring RAG retrieval quality with recall@k and MRR"
description: "A small, practical way to test the retrieval step of a RAG system: build a labelled question set, compute recall@k and MRR in Python, and compare chunking settings."
date: 2026-11-24
tags: [ai, rag, llm, python, testing]
lang: en
---

## Why test retrieval on its own

When a retrieval-augmented generation (RAG) system gives a bad answer, there are two very different causes. Either the retriever never found the right passage, or it found it and the model ignored or misread it. If you only look at final answers, you cannot tell these apart, and you end up tweaking prompts when the real problem is chunking or the embedding model.

So I test retrieval separately. It is cheap, it is deterministic, and it does not need an LLM call per test case. The idea is simple: for a set of questions, I know which chunk or document holds the answer, and I check whether the retriever returns it near the top.

## Step 1: build a small labelled set

You do not need thousands of examples. Thirty to fifty realistic questions already show clear differences between configurations. For each question, record the IDs of the source documents that contain the answer. I label at document level (or section level) rather than chunk level, because chunk IDs change every time you change the chunk size.

A JSON Lines file is enough:

```json
{"question": "How long is the notice period for tenants?", "relevant": ["tenancy-guide#section-4"]}
{"question": "Which income counts towards housing benefit?", "relevant": ["housing-benefit#income", "faq#q12"]}
```

The best questions come from real users: support tickets, search logs, or questions colleagues actually ask. Questions you write yourself while looking at the document tend to reuse its exact wording, which makes keyword and vector search look better than they are.

## Step 2: the two metrics

**Recall@k** answers: for what share of questions did at least one relevant document appear in the top k results? If the generator only ever sees the top 5 chunks, recall@5 is the number that matters, because anything below position 5 is invisible to the model.

**MRR (mean reciprocal rank)** looks at where the first relevant result appears. A hit at rank 1 scores 1, rank 2 scores 0.5, rank 3 scores about 0.33, and a miss scores 0. The mean over all questions rewards putting the right passage at the very top, which matters because models tend to pay more attention to the first passages in a long context.

## Step 3: compute them

Here is the evaluation code I use. The `retrieve` function is whatever your system does: a vector store query, BM25, or a hybrid. It must return document IDs in ranked order, so map chunk hits back to their source document first and drop duplicates.

```python
import json

def load_cases(path):
    with open(path, encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]

def dedupe(ids):
    seen, out = set(), []
    for i in ids:
        if i not in seen:
            seen.add(i)
            out.append(i)
    return out

def evaluate(cases, retrieve, k=5):
    hits, rr_sum, misses = 0, 0.0, []
    for case in cases:
        ranked = dedupe(retrieve(case["question"]))[:k]
        relevant = set(case["relevant"])
        rank = next((i + 1 for i, d in enumerate(ranked) if d in relevant), None)
        if rank:
            hits += 1
            rr_sum += 1.0 / rank
        else:
            misses.append(case["question"])
    n = len(cases)
    return {"recall@k": hits / n, "mrr": rr_sum / n, "misses": misses}

if __name__ == "__main__":
    cases = load_cases("retrieval_cases.jsonl")
    result = evaluate(cases, retrieve=my_retriever, k=5)
    print(f"recall@5 {result['recall@k']:.2f}  MRR {result['mrr']:.2f}")
    for q in result["misses"]:
        print("MISS:", q)
```

Note that MRR here is computed within the top k, so a relevant document at rank 8 counts as a miss when k is 5. That matches what the generator actually sees.

## Step 4: compare configurations

The useful part is running the same cases against several setups and putting the numbers side by side. Typical knobs to compare:

- chunk size and overlap, for example 300 versus 800 tokens
- embedding model
- pure vector search versus hybrid search with BM25
- adding a reranker on the top 20 candidates
- splitting on headings instead of fixed lengths

```python
configs = {
    "chunks-300": retriever_300,
    "chunks-800": retriever_800,
    "hybrid-800": hybrid_800,
}
for name, fn in configs.items():
    r = evaluate(cases, fn, k=5)
    print(f"{name:12} recall@5={r['recall@k']:.2f} mrr={r['mrr']:.2f}")
```

Change one thing at a time. If you switch the chunk size and the embedding model together, you will not know which one helped.

## Read the misses, not just the numbers

The list of missed questions is often more valuable than the averages. When I go through misses, the causes usually fall into a few groups:

- **Vocabulary mismatch.** The user says "rent subsidy", the document says "housing benefit". Hybrid search or query rewriting helps here.
- **Answer split across chunks.** A table header ended up in one chunk and its rows in the next. Heading-aware splitting or more overlap fixes it.
- **Wrong label.** Sometimes the retriever found a better source than the one I labelled. Then I fix the test set.

## Keep it in CI

Once the script exists, run it whenever the ingestion pipeline, chunking code or embedding model changes. A simple threshold check is enough to catch regressions:

```python
assert result["recall@k"] >= 0.85, "retrieval recall dropped"
```

Pick the threshold from your own current baseline rather than a number from someone else's system, and raise it as the system improves.

## Wrap-up

Testing retrieval on its own turns RAG tuning from guesswork into a measurable loop: label a few dozen real questions, compute recall@k and MRR, change one setting, and compare. It takes an afternoon to set up, and after that every change to chunking or embeddings comes with a number instead of a feeling.
