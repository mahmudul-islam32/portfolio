---
title: "Zero-downtime schema migrations with expand and contract"
description: "Old and new code run side by side during every deploy. Here is how to change a database schema in small, safe steps so neither version breaks."
date: 2026-11-02
tags: [databases, backend, postgres, devops]
lang: en
---

## The deploy is the problem, not the SQL

Most schema changes look harmless in a pull request. Rename a column, add a `NOT NULL`, drop a table nobody uses. The trouble starts when you remember that a rolling deploy runs the old version and the new version of your service at the same time, against the same database. If the migration runs first, the old code breaks. If the code ships first, the new code breaks. Either way, someone sees errors.

The fix is not a cleverer migration tool. It is a habit: never make a change that only one version of the code can live with.

## Expand, migrate, contract

The pattern is usually called expand and contract (or parallel change). You split one risky change into several boring ones:

1. **Expand.** Add the new structure next to the old one. A new column, a new table, a new index. Nothing is removed, so old code keeps working.
2. **Migrate.** Ship code that writes to both the old and the new structure, then backfill existing rows. Once the data is complete, switch reads to the new structure.
3. **Contract.** When no running code touches the old structure any more, remove it in a later deploy.

Take renaming `users.fullname` to `users.display_name`. Instead of one `RENAME COLUMN`, you add `display_name`, deploy code that writes both columns, copy the old values across, switch reads to `display_name`, and only after that deploy is everywhere do you drop `fullname`. It takes three or four releases instead of one, but at no point can a request fail because of the schema.

## Watch the locks

Even an "expand" step can hurt if it takes a heavy lock. A few Postgres details are worth knowing:

- Adding a nullable column without a default only changes the catalog, so it is fast. Since Postgres 11, adding a column with a constant default is fast too.
- A plain `CREATE INDEX` blocks writes to the table while it builds. `CREATE INDEX CONCURRENTLY` does not, but it takes longer and cannot run inside a transaction block, so your migration tool needs to allow that.
- Setting `NOT NULL` on an existing column scans the whole table under an exclusive lock. A gentler route is to add a `CHECK (col IS NOT NULL) NOT VALID` constraint, run `VALIDATE CONSTRAINT` separately, and then set `NOT NULL`. From Postgres 12 on, the validated check lets it skip the scan.
- Set a short `lock_timeout` in migrations. A migration waiting for a lock also blocks every query queued behind it, so it is better to fail fast and retry than to freeze the table.

## Backfill in batches

Updating millions of rows in one statement creates a long transaction, lots of dead rows and a lot of replication lag. Backfill in batches of a few thousand rows, keyed by primary key, with a short pause between them. Make the job safe to rerun, because it will be interrupted at some point.

## Keep the steps visible

Each phase is a separate migration and a separate deploy, so write them down. I keep a short checklist in the pull request that introduces the expand step, listing the follow-up releases and what has to be true before each one. The contract step is the one people forget, and a schema full of half-dead columns is its own kind of debt.

None of this is exciting, and that is the point. A migration that cannot break the running code is one you can ship on a Friday afternoon without thinking twice.
