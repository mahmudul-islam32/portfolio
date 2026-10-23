---
title: "Database indexes, explained without the magic"
description: "Indexes fix slow queries but can slow down writes. What they actually do, and how to decide when one is worth it."
date: 2026-10-23
tags: [databases, backend, performance]
lang: en
---

## Why a query gets slow

Without an index, a database answering `WHERE email = 'a@example.com'` has one option: read every row in the table and check the value. That is called a full table scan. On a table with a few hundred rows nobody notices. On a table with millions of rows, the same query can turn from instant into painful, and it gets worse as the data grows.

## What an index is

An index is a separate data structure that keeps a copy of one or more columns in sorted order, with a pointer back to each row. Most relational databases, including PostgreSQL and MySQL with InnoDB, use a **B-tree** for this by default. Because the values are sorted and the tree is shallow, the database can jump close to the value it needs in a handful of steps instead of reading everything.

Think of the index at the back of a book. You do not read the whole book to find "replication"; you look it up alphabetically and go straight to the page.

## Composite indexes and column order

An index can cover several columns, for example `(customer_id, created_at)`. The order matters. This index helps queries that filter on `customer_id`, or on `customer_id` and `created_at` together, and it can also return one customer's rows already sorted by date. It does not help much with a query that filters only on `created_at`, because the data is sorted by customer first.

A useful rule of thumb: put the columns you filter on with equality first, and the column you sort or range over last.

## The cost side

Indexes are not free:

- **Writes get slower.** Every insert, update, or delete has to update each index on the table as well.
- **They use storage and memory.** Large indexes compete with your data for cache space.
- **Unused indexes still cost.** An index nobody queries is pure overhead.

So the goal is not "index everything", it is "index what your real queries need".

## How to decide

1. Find the slow queries first, using your database's slow query log or monitoring.
2. Run them with `EXPLAIN` (or `EXPLAIN ANALYZE` in PostgreSQL) to see whether the planner is scanning the whole table.
3. Add an index that matches the filter and sort pattern, then check the plan again.
4. Periodically look for indexes that are never used and remove them.

Also keep in mind that the planner may skip an index when a query matches a large share of the table, because reading the table directly is cheaper. That is expected, not a bug.

## Takeaway

An index trades some write speed and storage for much faster reads on specific access patterns. Measure the query, read the plan, and add the index that matches how the data is really queried.
