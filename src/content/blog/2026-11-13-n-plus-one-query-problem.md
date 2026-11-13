---
title: "The N+1 query problem and how to spot it"
description: "Why a page that lists 50 orders can quietly run 51 database queries, how to see it in your logs, and the two common ways ORMs fix it."
date: 2026-11-13
tags: [databases, backend, performance, python]
lang: en
---

## A page that gets slower with every row

You build an endpoint that returns the latest 50 orders, each with the customer's name. In development, with five orders, it feels instant. In production it takes noticeably longer, and the time grows with the page size. The database is not overloaded and every single query is fast. The problem is how many of them there are.

## Where the extra queries come from

Most ORMs load related objects lazily. You ask for the orders, and the ORM runs one query. Then your code loops over them and touches `order.customer.name`. The customer is not loaded yet, so for each order the ORM quietly runs another query to fetch it.

```python
orders = session.scalars(select(Order).limit(50)).all()  # 1 query
for order in orders:
    print(order.customer.name)  # 1 query per order
```

That is one query for the list plus N queries for the related rows: N+1. Each query is cheap, but each one is also a network round trip, a trip through the [connection pool](/blog/2026-10-28-database-connection-pooling/) and some parsing and planning on the server. Fifty small round trips add up to far more than one slightly bigger query, and the cost grows linearly with the data.

## How to spot it

The code that causes it looks innocent, so you find N+1 by watching the queries, not by reading the loop.

- **Log the SQL in development.** SQLAlchemy prints every statement with `echo=True` on the engine, and Django exposes the queries of a request through `connection.queries` when `DEBUG` is on. A wall of near-identical `SELECT ... WHERE id = ?` lines is the signature.
- **Count queries in tests.** Django's `assertNumQueries` fails a test when an endpoint runs more queries than expected, which catches a regression before it ships.
- **Look at the database side.** In PostgreSQL, `pg_stat_statements` shows which statements run most often. A simple lookup by primary key with a huge call count is a strong hint.
- **Read your traces.** If you trace requests, an N+1 shows up as a long ladder of tiny database spans under one request.

## Fix 1: join the related rows

The first option is to fetch the related rows in the same query with a JOIN. Django calls this `select_related`, and SQLAlchemy calls it `joinedload`.

```python
orders = session.scalars(
    select(Order).options(joinedload(Order.customer)).limit(50)
).all()
```

This works best for many-to-one relations such as order to customer, where each row has exactly one related row and the join does not multiply the results.

## Fix 2: load the related rows in one extra query

For one-to-many relations, such as an order and its line items, a join repeats the order columns for every item. The usual alternative is to run a second query that loads all related rows at once with `WHERE order_id IN (...)`, then match them up in memory. Django calls this `prefetch_related`, and SQLAlchemy calls it `selectinload`. However many orders there are, that is two queries instead of N+1.

## Do not overcorrect

Eager loading everything by default creates the opposite problem: big joins and data nobody reads. Load relations eagerly where a specific endpoint needs them, keep an eye on the query count, and make sure the foreign key columns used in those lookups are [indexed](/blog/2026-10-23-database-indexes-explained/).

## Takeaway

N+1 is not about slow queries but about too many of them. Make the SQL visible in development, guard important endpoints with a query count in tests, and choose a join or a batched second query depending on the shape of the relation.
