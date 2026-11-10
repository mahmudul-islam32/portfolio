---
title: "Optimistic locking: stopping lost updates with a version column"
description: "When two people edit the same record, the last save quietly wins. A version column lets the database notice the conflict and reject the stale write."
date: 2026-11-10
tags: [databases, backend, api-design]
lang: en
---

## The lost update

Two people open the same customer record in an admin screen. One fixes the phone number, the other changes the address. Both press save. The second save sends the whole record as that person saw it, so the phone number fix disappears. Nobody gets an error, and nobody notices until a customer complains.

This is called a lost update. It happens whenever an application reads a row, lets someone change it for a while, and then writes it back without checking whether it changed in the meantime.

## Pessimistic vs optimistic

One fix is to lock the row while someone is editing it, for example with `SELECT ... FOR UPDATE` inside a transaction. That works for short operations inside a single request, but it does not fit an edit form that stays open for ten minutes. You cannot hold a database transaction open while a person drinks their coffee.

Optimistic locking takes the opposite view: conflicts are rare, so let everyone read and edit freely, and only check for a conflict at the moment of writing.

## A version column

Add an integer column that goes up by one on every update:

```sql
ALTER TABLE customers ADD COLUMN version integer NOT NULL DEFAULT 1;
```

When you read a record, return its version along with the data. When the client saves, it sends back the version it started from, and the update only matches if that version is still current:

```sql
UPDATE customers
SET phone = $1, address = $2, version = version + 1
WHERE id = $3 AND version = $4;
```

The database does the comparison and the write in one statement, so there is no gap between checking and saving. If another save got there first, the version no longer matches, the `WHERE` clause finds nothing, and the statement reports zero affected rows. That number is your signal:

```python
result = await db.execute(UPDATE_CUSTOMER, phone, address, customer_id, version)
if result.rowcount == 0:
    raise ConflictError("This customer was changed by someone else. Reload and try again.")
```

A timestamp such as `updated_at` can play the same role, but an integer is simpler to compare and does not depend on clock precision.

## Exposing it in an API

Over HTTP the version fits naturally into an ETag. Return it in the `ETag` header on `GET`, and require clients to send it back in `If-Match` on `PUT` or `PATCH`. When it does not match, respond with `412 Precondition Failed`. If you prefer to keep it in the body, a `version` field and a `409 Conflict` response work too. What matters is that the client gets a clear answer instead of a silent overwrite.

Many ORMs support this directly. Hibernate and JPA have the `@Version` annotation, SQLAlchemy has the `version_id_col` mapper option, and Entity Framework has concurrency tokens. They all generate the same kind of conditional update.

## What to do on a conflict

The database can only detect the conflict. Deciding what happens next is a product question:

- **Show it to the user.** Reload the record, keep their unsaved changes visible, and let them decide. This is the right default for forms.
- **Retry automatically.** For background jobs that recompute a value from the current state, reading again and reapplying the change is often fine.
- **Merge field by field.** If the two edits touched different fields, you can sometimes combine them, but only when you are sure the fields are independent.

## When it is not the right tool

If the same row is updated constantly, such as a counter or a stock level, optimistic locking leads to many failed attempts. An atomic update like `SET stock = stock - 1 WHERE stock > 0` avoids the read-modify-write cycle entirely.

For everything people edit through a form, a version column costs one integer and one extra condition, and it turns a silent data loss into a message the user can act on.
