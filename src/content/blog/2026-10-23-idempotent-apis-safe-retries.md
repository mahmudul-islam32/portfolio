---
title: "Idempotent APIs and why retries should be safe"
description: "Networks fail in awkward ways. Designing endpoints so that a repeated request does no extra harm is one of the cheapest reliability wins you can get."
date: 2026-10-23
tags: [api-design, backend, reliability]
lang: en
---

## The problem with "did it work?"

Imagine a client sends a request to create an order. The server creates it, but the response is lost on the way back. The client sees a timeout. Did the order get created? The client cannot know, so it has two bad options: give up and risk a missing order, or retry and risk a duplicate one.

This is not an exotic edge case. Timeouts, dropped connections, load balancer restarts, and impatient users double-clicking a button all produce the same situation. Any system that talks over a network has to answer it.

## What idempotent means

An operation is **idempotent** if performing it several times has the same effect as performing it once. In HTTP, `GET`, `PUT`, and `DELETE` are defined as idempotent. Setting a user's email to a given value or deleting a resource can be repeated without changing the outcome after the first call. `POST` is not idempotent by definition, which is exactly why "create something" endpoints need extra care.

## Idempotency keys

A common pattern for `POST` endpoints is the **idempotency key**. The client generates a unique value, such as a UUID, and sends it with the request, often in an `Idempotency-Key` header. The server then does the following:

1. Looks up the key. If it has never seen it, it processes the request and stores the key together with the response it produced.
2. If it has seen the key, it skips the work and returns the stored response.

Payment APIs popularised this approach because charging a card twice is a costly mistake, but it is just as useful for orders, emails, and any other side effect you would rather not repeat.

## A minimal sketch

```ts
async function createOrder(req: Request) {
  const key = req.headers.get('Idempotency-Key');
  if (!key) return new Response('Idempotency-Key required', { status: 400 });

  const saved = await store.get(key);
  if (saved) return new Response(saved.body, { status: saved.status });

  const order = await orders.create(await req.json());
  const body = JSON.stringify(order);
  await store.set(key, { status: 201, body });
  return new Response(body, { status: 201 });
}
```

This version has a gap: two identical requests arriving at the same moment could both pass the lookup. In a real system, make the check and the write atomic, for example with a unique constraint on the key in your database, and decide what happens to a request whose key is currently being processed.

## Details worth deciding early

- **Scope keys per client or user**, so one customer cannot collide with another.
- **Compare the payload.** If the same key arrives with a different body, reject it instead of silently returning an unrelated response.
- **Expire old keys** after a sensible window so the store does not grow forever.
- **Make consumers idempotent too.** With message queues that deliver at least once, a handler may see the same message twice, so deduplicate by message ID.

## Takeaway

You cannot prevent failures, but you can make retrying cheap and harmless. If a client is allowed to ask twice, make sure the second answer is the same as the first.
