---
title: "Deadlocks in PostgreSQL: why they happen and how to avoid them"
description: "How two transactions end up waiting on each other in PostgreSQL, what the database does about it, and the habits that keep deadlocks rare in application code."
date: 2026-11-15
tags: [databases, backend, postgres, reliability]
lang: en
---

## Two transactions, each holding what the other needs

A deadlock is a cycle of waiting. Transaction A holds a lock that B needs, and B holds a lock that A needs. Neither can continue, and neither will give up on its own.

The classic example is a money transfer that updates two rows:

```sql
-- Session A: transfer from account 1 to account 2
BEGIN;
UPDATE accounts SET balance = balance - 10 WHERE id = 1;
-- Session B: transfer from account 2 to account 1
BEGIN;
UPDATE accounts SET balance = balance - 10 WHERE id = 2;
-- Session A
UPDATE accounts SET balance = balance + 10 WHERE id = 2;  -- waits for B
-- Session B
UPDATE accounts SET balance = balance + 10 WHERE id = 1;  -- waits for A: deadlock
```

Each `UPDATE` takes a row lock that is held until the transaction ends. Both sessions did nothing unusual, they simply touched the same rows in opposite order.

## What PostgreSQL does about it

PostgreSQL does not let the sessions wait forever. When a transaction has been waiting for a lock longer than `deadlock_timeout` (one second by default), the server checks whether the wait is part of a cycle. If it is, it aborts one of the transactions with SQLSTATE `40P01` and the message `deadlock detected`. The detail lines name the processes and the locks they were waiting for, and the other transaction then continues normally.

So a deadlock is not a hang, it is an error that one of your requests receives. That changes the question from "how do I recover" to "how often does this happen and what does my code do when it does".

## Lock things in a consistent order

Most application deadlocks come from the pattern above: two code paths lock the same set of rows in a different order. The fix is to agree on an order and always follow it. For the transfer, update the account with the lower id first, regardless of which direction the money moves.

When you need several rows at once, lock them up front in a fixed order:

```sql
SELECT id FROM accounts WHERE id IN (1, 2) ORDER BY id FOR UPDATE;
```

The same idea applies across tables. If one handler updates `orders` and then `invoices`, another handler should not update `invoices` first and then `orders` in a single transaction.

## Keep transactions short

The longer a transaction holds its locks, the bigger the window in which another transaction can collide with it. Do slow work such as HTTP calls, file uploads or sending emails outside the transaction, and commit as soon as the writes are done. Fewer, shorter transactions mean fewer chances for a cycle to form.

Bulk updates deserve attention too. Two jobs updating overlapping sets of rows in whatever order the planner returns them can deadlock each other. Splitting the work into smaller batches, each sorted by primary key, reduces both the lock time and the risk.

## Retry, and watch the logs

You cannot rule deadlocks out completely, so treat `40P01` like the serialization failures from the [isolation levels post](/blog/2026-11-14-postgres-transaction-isolation-levels/): retry the whole transaction a few times with [backoff and jitter](/blog/2026-11-03-retries-exponential-backoff-jitter/), and make sure the work is safe to run more than once.

Then make them visible. Deadlocks are written to the server log, and turning on `log_lock_waits` also logs any lock wait longer than `deadlock_timeout`, which often points to the hot rows before they turn into real deadlocks. If the same pair of queries keeps showing up, that is usually a lock ordering problem worth fixing in code rather than retrying forever.
