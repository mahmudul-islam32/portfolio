---
title: "The transactional outbox: saving data and publishing events reliably"
description: "Writing to the database and publishing a message are two separate steps that can fail independently. The outbox pattern turns them into one transaction."
date: 2026-11-05
tags: [backend, reliability, architecture, databases]
lang: en
---

## The dual write problem

A common piece of service code looks like this: save an order to the database, then publish an `OrderCreated` event so the invoicing and notification services can react. It works in testing, and it hides a subtle bug.

Those are two writes to two different systems, and nothing makes them happen together. If the process crashes, the broker is unreachable or the network drops right after the database commit, the order exists but the event is never sent. Swap the order and publish first, and you get the opposite failure: an event about an order that was rolled back. Retrying inside the same request does not fix it, because the crash can happen between any two lines.

Distributed transactions across a database and a message broker exist, but they are complex, slow and often not supported by the tools you already use. The outbox pattern is the simpler answer.

## How the outbox works

Instead of publishing directly, the service writes the event into an `outbox` table in the same database, inside the same transaction as the business data:

```sql
BEGIN;
INSERT INTO orders (id, customer_id, total) VALUES ($1, $2, $3);
INSERT INTO outbox (id, topic, payload, created_at)
VALUES ($4, 'order.created', $5, now());
COMMIT;
```

Now the two writes are atomic. Either both the order and its event are stored, or neither is. The database guarantees it, so there is no window where one exists without the other.

A separate process, often called the relay, then reads unsent rows from the outbox, publishes them to the broker and marks them as sent:

```sql
SELECT id, topic, payload FROM outbox
WHERE sent_at IS NULL
ORDER BY created_at
LIMIT 100
FOR UPDATE SKIP LOCKED;
```

`FOR UPDATE SKIP LOCKED` in PostgreSQL lets several relay workers run at once without picking up the same rows. After the broker confirms each message, the relay sets `sent_at` or deletes the row.

## At least once, not exactly once

The relay can still crash after publishing but before marking a row as sent. When it restarts, it publishes that row again. So the outbox gives you at-least-once delivery: no event is lost, but some may arrive twice.

That is a good trade, but it means consumers must be idempotent. Give every event a stable ID (the outbox row ID works well) and have consumers record which IDs they have already processed, ideally in the same transaction as the work they do. I covered the same idea for HTTP requests in [idempotent APIs and safe retries](/blog/2026-10-23-idempotent-apis-safe-retries/).

## Polling or change data capture

There are two common ways to build the relay:

- **Polling.** A small worker queries the table every second or so. It is easy to understand and runs anywhere, at the cost of some latency and steady database load.
- **Change data capture.** A tool such as Debezium reads the database's write-ahead log and turns new outbox rows into messages. Latency is lower and there is no polling query, but you take on another piece of infrastructure.

For many teams, polling is the right place to start.

## Things to keep in mind

- **Clean up.** Delete or archive sent rows on a schedule, or the table grows forever.
- **Ordering.** If consumers need events for the same entity in order, publish them in `created_at` order per entity, and use a partition key such as the order ID on the broker.
- **Monitor the backlog.** Alert when the oldest unsent row is older than a few minutes; it usually means the relay or the broker is stuck.

## Takeaway

If a service must both change its data and tell others about it, do not trust two separate writes. Put the event in the same transaction as the data, publish it afterwards, and make the receiving side safe to call twice.
