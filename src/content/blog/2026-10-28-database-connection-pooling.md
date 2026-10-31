---
title: "Database connection pooling: what it is and how to size it"
description: "Why opening a database connection per request hurts, how a connection pool fixes it, and how to choose pool sizes that do not overload your database."
date: 2026-10-28
tags: [databases, backend, postgres, performance]
lang: en
---

## The cost of a new connection

Opening a database connection is not free. The client and server do a TCP handshake, often a TLS handshake on top of that, and then the database authenticates the user and sets up a session. PostgreSQL goes further and starts a separate backend process for every connection. None of this is slow on its own, but if every incoming HTTP request opens and closes its own connection, that setup work is repeated thousands of times a minute and shows up as extra latency and CPU load.

## What a pool does

A connection pool keeps a set of open connections and lends them out. When your code needs to run a query, it borrows a connection, uses it, and hands it back instead of closing it. The next request reuses the same connection, so the setup cost is paid once rather than every time.

Most frameworks give you this almost for free. SQLAlchemy creates a pool behind every engine, Node drivers like `pg` ship a `Pool` class, and Java applications commonly use HikariCP. The important part is not turning it on but configuring it sensibly.

## The settings that matter

A few options appear in nearly every pool:

- **Maximum size**: the most connections the pool will open at once.
- **Minimum or idle size**: how many connections it keeps open when traffic is quiet.
- **Acquire timeout**: how long a request waits for a free connection before failing.
- **Idle timeout and max lifetime**: when to close connections that sit unused or have lived too long, which helps with firewalls and load balancers that silently drop old connections.

## Bigger is not better

It is tempting to set the maximum size high so requests never wait. In practice this often makes things worse. A database server has a limited number of CPU cores and a limited amount of disk bandwidth. Once there are more active queries than it can actually run in parallel, extra connections just compete for the same resources, add context switching and memory use, and make every query slower.

A smaller pool with a short queue in front of it usually gives better throughput. Requests wait a few milliseconds for a connection instead of all crowding into the database at once. Start small, measure latency and wait time under realistic load, and grow only if the database still has headroom.

## Watch the total, not one service

The limit that really counts is the database's own maximum connection count. If you run ten replicas of a service and each has a pool of 20, that is up to 200 connections, plus whatever your workers, cron jobs and admin tools open. With autoscaling, that number can jump suddenly and hit the server's limit, at which point new connections are refused.

When many small processes need to share one database, a separate pooler such as PgBouncer sits between them and the server. Applications connect to the pooler, and it keeps a much smaller number of real connections to PostgreSQL. In transaction pooling mode, a server connection is only held for the length of a transaction, which lets a large number of clients share a few connections. The trade-off is that session-level features, such as session variables or some uses of prepared statements, need care.

## Common mistakes

- Forgetting to return connections, for example by not closing a session in an error path. The pool slowly drains until every request times out.
- Holding a connection while doing slow non-database work, like calling an external API inside a transaction.
- Creating a new pool per request by building the engine or client inside a handler instead of once at startup.

## Takeaway

Pool connections, keep the pool smaller than your instinct suggests, add up the connections across every instance, and reach for a dedicated pooler when the number of clients grows. Those few decisions prevent a whole class of production incidents that only show up under load.
