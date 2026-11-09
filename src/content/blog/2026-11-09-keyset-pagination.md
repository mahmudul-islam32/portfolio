---
title: "Keyset pagination: paging through large tables without OFFSET"
description: "OFFSET pagination gets slower and less reliable as tables grow. Keyset pagination uses the last row you saw instead, and it pairs well with an index."
date: 2026-11-09
tags: [databases, backend, api-design, performance]
lang: en
---

## The usual approach

Most list endpoints start with page numbers. The client asks for page 3 with 20 items per page, and the server runs something like this:

```sql
SELECT id, created_at, total
FROM orders
ORDER BY created_at DESC, id DESC
LIMIT 20 OFFSET 40;
```

It is easy to build and easy to understand. It also has two problems that only show up once the table and the traffic grow.

## Why OFFSET gets slow

`OFFSET 40` does not mean "start at row 41" in any cheap way. The database still has to produce the first 40 rows in order and then throw them away. On page 3 nobody notices. On page 5,000 the database is reading and discarding 100,000 rows to return 20, and the cost keeps growing the deeper a client goes. Crawlers, exports and "load everything" scripts tend to go very deep.

## Why OFFSET skips and repeats rows

The second problem is correctness. If a new order is inserted while a client is reading page 1, every row shifts down by one. When the client asks for page 2, the last row of page 1 shows up again. If a row is deleted instead, one row is skipped and never seen. For a feed this is annoying; for a sync job or an export it means missing or duplicated data.

## Keyset pagination

Keyset pagination (sometimes called cursor or seek pagination) replaces "skip N rows" with "continue after the last row I saw". The client sends back the sort values of the final row on the previous page, and the query filters on them:

```sql
SELECT id, created_at, total
FROM orders
WHERE (created_at, id) < ('2026-11-08 14:02:11', 81734)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

The row-value comparison `(created_at, id) < (...)` is supported by PostgreSQL and MySQL. It means "earlier timestamp, or the same timestamp with a smaller id", which matches the sort order exactly.

A few details make it work:

- **The sort must be unique.** `created_at` alone can have ties, and ties make rows disappear between pages. Adding the primary key as the last sort column breaks every tie.
- **Index the sort columns.** With an index on `(created_at, id)`, the database can jump straight to the starting point and read 20 entries, so page 5,000 costs about the same as page 1. I wrote more about matching indexes to queries in [Database indexes, explained without the magic](/blog/2026-10-23-database-indexes-explained/).
- **Inserts and deletes no longer shift pages.** The position is anchored to a value, not a count.

## Shaping the API

Instead of exposing raw columns, most APIs return an opaque cursor, for example the last row's `created_at` and `id` encoded as base64 JSON, plus a flag or link for the next page:

```json
{ "items": [ ... ], "next_cursor": "eyJjIjoiMjAyNi0xMS0wOFQxNDowMjoxMSIsImkiOjgxNzM0fQ" }
```

Treat the cursor as untrusted input: decode it, validate the types, and return a 400 if it is malformed. Keeping it opaque also lets you change the sort columns later without breaking clients.

## The trade-offs

| | OFFSET | Keyset |
|---|---|---|
| Jump to page 37 | Yes | No, only next and previous |
| Cost of deep pages | Grows with depth | Roughly constant with an index |
| Stable under inserts | No | Yes |
| Total page count | Easy | Needs a separate count query |

If users really need numbered pages over a small, mostly static set, OFFSET is fine. For feeds, infinite scroll, sync endpoints and exports, keyset pagination is usually the better default.

## Takeaway

Page by position only when the data is small. For anything that grows, remember the last row you returned, make the sort order unique, back it with a matching index, and hand the client an opaque cursor.
