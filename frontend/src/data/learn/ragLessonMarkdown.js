/**
 * Full lesson bodies (Markdown + GFM). Keys must match `slug` in `catalog.js`.
 */
export const RAG_LESSON_MARKDOWN = {
  'what-problem-rag-solves': `## Why RAG matters

Large language models compress the world into weights. They are fluent, but **they are not a database** of your private docs, your latest policy PDF, or yesterday’s incident report. **Retrieval-Augmented Generation (RAG)** fixes that gap by *fetching evidence first*, then asking the model to answer *using that evidence*.

### Symptoms without retrieval

- **Hallucinated details** — plausible-sounding numbers or names that never appeared in your sources.
- **Stale answers** — training cutoff means new products, pricing, or laws are missing.
- **No citations** — users cannot verify claims, which breaks trust in regulated settings.

### What “grounded” usually means

For a RAG app, define success up front:

1. The answer uses **only** (or overwhelmingly) facts supported by retrieved passages.
2. When evidence is weak, the system **refuses** or asks a clarifying question instead of guessing.
3. You can **trace** which chunks supported each sentence (for debugging and audits).

## A tiny mental model

Think in three boxes:

| Step | Responsibility |
| --- | --- |
| **Index** | Turn documents into searchable units (chunks) + vectors or keywords. |
| **Retrieve** | Given a user question, pull the best candidate chunks. |
| **Generate** | Prompt the model with *question + chunks* and strict instructions. |

Nothing here requires a vector database on day one—you can prototype with embeddings + simple similarity, or even keyword search, and still learn the moving parts.

## Example: the failure mode you are avoiding

\`\`\`python
# Anti-pattern: question goes straight to the model with no retrieval
user_q = "What is our refund SLA for enterprise accounts?"
answer = llm.complete(user_q)  # may invent a policy
\`\`\`

With RAG, \`user_q\` first hits your **policy index**, retrieved chunks are injected, and the model is asked to **quote or summarize only from those chunks**. Same API surface—different reliability profile.

## What you will build in this course

By the end you will understand chunking trade-offs, embedding lifecycle, retrieval tuning, grounded prompts, and lightweight evaluation so improvements do not rely on vibes alone.`,

  'documents-and-chunking': `## Why chunking is not “split every 500 tokens”

Retrieval quality starts here. A **chunk** is the atomic unit you embed, store, and later retrieve. If chunks split mid-sentence—or merge unrelated topics—your embeddings blur and recall drops.

### Good chunk properties

- **Semantic coherence** — one topic or procedure per chunk when possible.
- **Stable boundaries** — prefer splitting on headings, blank lines, or slide titles.
- **Overlap** — a small overlap (for example 10–20% of chunk size) reduces “lost context at the boundary”.

### Metadata you should keep

Attach fields you may filter on later:

- \`source_file\`, \`page\`, \`section_title\`, \`updated_at\`, \`audience\`, \`product_line\`, etc.

\`\`\`json
{
  "text": "## Refund policy\\nEnterprise accounts may request...",
  "metadata": {
    "source_file": "billing-policy.md",
    "section_title": "Refund policy",
    "updated_at": "2026-05-01"
  }
}
\`\`\`

## Practical sizing heuristics

| Document type | Starting point |
| --- | --- |
| Markdown / HTML with headings | Split on \`h2\` / \`h3\` first, then cap max size. |
| PDFs with noisy layout | Prefer paragraph blocks; avoid header/footer garbage. |
| Chat logs | Window by speaker turns + timestamp. |

## Exercise outline

1. Pick one real document you care about.
2. Implement two chunkers: fixed-size vs heading-aware.
3. For five random questions, eyeball which chunk *should* contain the answer—note misses.

You will reuse these chunks in the embedding lesson.`,

  'embeddings-in-one-pass': `## What an embedding is (in one paragraph)

An **embedding** is a fixed-length vector representing text such that *similar meaning* tends to land *closer in vector space*. You pass a chunk through a model and get floats—those floats are what your vector index searches.

## Batching and idempotency

Production ingestion is a pipeline, not a script you run once.

\`\`\`python
def embed_batch(chunks, model="text-embedding-3-small"):
    texts = [c["text"] for c in chunks]
    vectors = client.embeddings.create(model=model, input=texts)
    return [d.embedding for d in vectors.data]
\`\`\`

- **Batch** to reduce API overhead and amortize cost.
- **Idempotency**: store \`(content_hash, model_version) → vector\` so re-runs do not duplicate work.
- **Versioning**: when you change embedding models, **re-embed everything** and treat it as a new index.

## Normalization and distance

Many stacks use **cosine similarity** on **L2-normalized** vectors. If your library expects normalized inputs, normalize consistently at index and query time.

## Failure modes to expect

- **Short chunks** (titles only) produce noisy vectors—pair titles with body text.
- **Huge chunks** dilute the embedding—multiple topics average into mush.
- **Language mismatch** — embedding models are multilingual to different degrees; test your languages.

## Mini checklist before moving on

- [ ] You can point to where embeddings are stored and how they are updated.
- [ ] You can re-run ingestion without duplicating rows.
- [ ] You log **model name + dimensions** next to the index.`,

  'vector-vs-keyword-search': `## Two families of retrieval

**Dense (vector)** retrieval matches *meaning* and paraphrases. **Sparse (keyword / BM25)** retrieval matches *tokens* and rare identifiers. Most serious systems end up with **hybrid** ideas somewhere in the stack.

### When vectors shine

- User questions do not repeat document wording (“How do I undo a payout?” vs “Reverse transfer”).
- You need semantic grouping across many phrasings.

### When keywords shine

- SKUs, error codes, legal citations, UUIDs, and exact product names.
- Very short queries where dense vectors are unstable.

## Comparison table

| Aspect | Vector (dense) | Keyword (BM25-style) |
| --- | --- | --- |
| **Paraphrase robustness** | Strong | Weak |
| **Rare exact tokens** | Can miss | Strong |
| **Index size / cost** | Higher | Lower |
| **Ops maturity** | Newer moving parts | Battle-tested in search engines |

## Hybrid pattern (conceptual)

1. Retrieve top \`k1\` with BM25 for literal signals.
2. Retrieve top \`k2\` with vectors for semantic breadth.
3. **Merge + dedupe** chunks, optionally **rerank** with a cross-encoder.

\`\`\`text
query ─┬─► BM25 index ─► candidates A
       └─► Vector index ─► candidates B
                 │
                 ▼
           merge / rerank / top-k
\`\`\`

## “Do I need a vector DB?”

If you are small: **Postgres + pgvector** (or your cloud’s equivalent) is often enough. Dedicated vector databases help at scale with sharding, filtering ergonomics, and ops—but they are not a prerequisite to learn RAG well.`,

  'minimal-rag-pipeline': `## The smallest useful loop

1. **Ingest** documents → chunks + metadata.
2. **Embed** chunks (or build a sparse index instead).
3. **Retrieve** top-\`k\` chunks for a query.
4. **Prompt** the model with *only* those chunks + a tight system message.
5. **Log** query, chunk ids, and model output for debugging.

## Pseudocode: end-to-end

\`\`\`python
def answer_question(user_query: str) -> str:
    q_vec = embed(user_query)
    hits = vector_store.search(q_vec, top_k=6)
    context = "\\n\\n".join(h.text for h in hits)
    return llm.chat(
        system="Answer using ONLY the context. If insufficient, say you do not know.",
        user=f"Context:\\n{context}\\n\\nQuestion:\\n{user_query}",
    )
\`\`\`

### Guardrails that cost almost nothing

- Hard cap on **characters** injected into the prompt.
- Require **short quotes** for factual claims when possible.
- Return **chunk ids** to the UI for internal tools (not always to end users).

## What to instrument first

| Field | Why |
| --- | --- |
| \`retrieved_chunk_ids\` | Reproduce bad answers quickly. |
| \`latency_ms_retrieval\` / \`latency_ms_llm\` | Know what to optimize. |
| \`model_name\` + \`prompt_version\` | Compare experiments fairly. |

Once this loop is boring and reliable, you are ready to tune retrieval quality aggressively.`,

  'retrieval-quality': `## Beyond “increase top-k”

Raising \`k\` adds noise. Lowering \`k\` misses evidence. Better levers:

### MMR (Maximal Marginal Relevance)

Balances **relevance** with **diversity** so you do not retrieve six near-duplicate chunks that crowd out complementary facts.

### Metadata filters

If users always ask within one *product* or *region*, filter first—smaller candidate sets mean better precision.

### Reranking

Use a cheap first stage (vector/BM25), then a **cross-encoder** or small reranker model on the top 30 → final 6.

## Debugging a miss (checklist)

1. **Was the answer in the corpus at all?** If no, RAG cannot save you.
2. **Was it chunked away?** Boundary problem → fix chunking.
3. **Was the query rewritten poorly?** Try simple synonym expansion or a tiny LLM rewrite step.
4. **Was embedding space misleading?** Try hybrid retrieval or a better embedding model.

\`\`\`bash
# Example: log top hits with scores for offline review
python scripts/dump_retrieval.py --query "refund SLA enterprise" --k 10
\`\`\`

## Metrics that are actually measurable

- **Recall@k (manual)** — for a labeled question, is a gold passage in the top \`k\`?
- **MRR** — how highly ranked is the first correct passage?
- **Answer faithfulness** — human or model judge checks citations vs chunk text.`,

  'grounding-prompts': `## Prompt shape that survives contact with users

Keep three layers explicit:

1. **System** — role, safety, and “use only context”.
2. **Context** — retrieved chunks with stable labels (\`[S1]\`, \`[S2]\`).
3. **User** — the actual question.

### Example system snippet

\`\`\`text
You are a support assistant. Use ONLY the provided context.
If the context does not contain enough information, reply exactly:
"I do not have enough information in the provided sources."
Cite sources like [S2] after sentences that rely on a chunk.
\`\`\`

## Trimming noise before the LLM call

- Remove chunks below a **similarity threshold**.
- **De-duplicate** near-identical passages.
- Prefer **shorter quotes** over dumping entire PDF pages.

## Handling conflicts

If \`[S1]\` and \`[S4]\` disagree, instruct the model to **surface the conflict** instead of averaging fiction:

> “Source [S1] says 14 days; source [S4] says 30 days for enterprise—please confirm which contract applies.”

This behavior is learned through **clear instructions** and a few **adversarial examples** in your eval set.`,

  'rag-evaluation': `## Build a golden set (small but serious)

Start with **20–50** questions that real users ask. For each item store:

- The **question**
- **Gold chunk ids** (or gold passage text)
- Optional: **ideal short answer** rubric

\`\`\`yaml
- id: q-014
  question: "What is the enterprise refund SLA?"
  gold_chunk_ids: ["policies/billing.md#refunds"]
  notes: "Answer must mention 30-day window for enterprise."
\`\`\`

## Two-layer evaluation

| Layer | What it tells you |
| --- | --- |
| **Retrieval** | Did the right evidence appear in top-\`k\`? |
| **Generation** | Did the model stay faithful to that evidence? |

## Regression workflow

1. Run the golden set on **every** retrieval or prompt change.
2. Track pass rate over time in a spreadsheet or CI artifact.
3. When a change helps one case and hurts another, **add both** to the golden set.

You do not need perfect automation on day one—**consistency** beats sophistication.`,

  'rag-production': `## Production is mostly boring constraints

### Latency and cost budgets

- Cache embeddings for **unchanged** chunks.
- Consider **smaller** embedding models for first drafts; upgrade path for hard cases.
- Stream LLM tokens to the UI while retrieval stays fast.

### Freshness

Documents change. You need:

- **Incremental** re-index jobs when files update.
- Tombstones or version numbers so stale chunks do not win forever.

### Access control

If users may only see **some** documents, enforce ACL **before** retrieval joins the prompt—not after.

### PII and secrets

Scan sources for emails, tokens, and keys. Redact at index time when possible.

## Observability trace (ideal)

\`\`\`text
trace_id: 9f3c...
  query: "..."
  retrieved: [chunk-12, chunk-44, chunk-90]
  prompt_tokens: 1832
  model: gpt-4.1-mini
  latency_ms: {retrieve: 42, llm: 910}
\`\`\`

Ship the **minimal RAG loop** first; then tighten each of the above knobs with measurements instead of instinct.`,
};
