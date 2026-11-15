---
title: "Transaction isolation levels in PostgreSQL, explained with examples"
description: "What Read Committed, Repeatable Read and Serializable actually protect you from in PostgreSQL, and why the stricter levels mean your code must retry."
date: 2026-11-14
tags: [databases, backend, postgres, reliability]
lang: en
---

## Two queries, one transaction, different answers

Wrapping work in `BEGIN` and `COMMIT` makes it atomic: either everything is saved or nothing is. It does not, by default, freeze the world around you. While your transaction runs, other transactions keep committing, and how much of their work you can see is decided by the isolation level.

PostgreSQL supports the four levels from the SQL standard, but it treats `READ UNCOMMITTED` the same as `READ COMMITTED`, so in practice there are three to choose from.

## Read Committed, the default

In Read Committed, every statement sees a fresh snapshot of the data committed before that statement started. You never see another transaction's uncommitted changes, but two `SELECT`s in the same transaction can return different results if someone commits in between.

```sql
BEGIN;
SELECT balance FROM accounts WHERE id = 1;  -- 100
-- another session commits: UPDATE accounts SET balance = 50 WHERE id = 1;
SELECT balance FROM accounts WHERE id = 1;  -- 50
COMMIT;
```

For most web requests this is fine. The trap is the read-modify-write pattern: read a value, compute something in application code, write it back. Two requests can read the same old value and the second write silently overwrites the first. The usual fixes work well at this level: an atomic `UPDATE ... SET stock = stock - 1`, `SELECT ... FOR UPDATE` to lock the row, or a [version column](/blog/2026-11-10-optimistic-locking-version-columns/).

## Repeatable Read

In Repeatable Read, the whole transaction works from one snapshot taken at its first query. Repeating a `SELECT` gives the same rows, which is useful for reports or exports that read several tables and need them to agree with each other.

The cost appears when you write. If you try to update or delete a row that another transaction changed and committed after your snapshot was taken, PostgreSQL does not quietly overwrite it. It aborts your transaction with a serialization failure, SQLSTATE `40001`, and expects you to try again.

## Serializable

Serializable goes one step further. PostgreSQL tracks which data each transaction read and wrote, and if a set of concurrent transactions could not have produced the same result when run one after another, it aborts one of them, again with `40001`.

This catches anomalies the other levels miss. A classic one is write skew: two doctors each check that at least one other doctor is on call, both see "yes", and both take themselves off call. Each transaction was correct alone, together they broke the rule. Under Serializable, one of them fails.

## Retries are part of the deal

The stricter levels do not make conflicts disappear; they turn silent bugs into errors. That only helps if your code handles the error. Wrap the whole transaction, not just the failed statement, in a retry loop that catches `40001`, with a small limit and some [backoff with jitter](/blog/2026-11-03-retries-exponential-backoff-jitter/). Keep these transactions short and free of side effects such as sending emails, because they may run more than once.

## How I choose

I stay on Read Committed for ordinary request handling and protect specific updates with atomic statements or row locks, taken in a consistent order so they do not [deadlock](/blog/2026-11-15-postgres-deadlocks/). I use Repeatable Read for read-only reports that need a consistent view. I reach for Serializable when a business rule spans several rows and is hard to express as a single constraint, and I make sure the retry logic is in place before I switch it on.
