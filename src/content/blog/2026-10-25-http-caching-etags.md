---
title: "HTTP caching basics: Cache-Control and ETags"
description: "How browsers and proxies decide when to reuse a response, and how Cache-Control and ETags let your API skip work it has already done."
date: 2026-10-25
tags: [http, performance, backend]
lang: en
---

## Why caching matters

Every request your server does not have to answer in full is time and money saved. HTTP has a caching system built in, and browsers, CDNs and reverse proxies all understand it. You do not need a special library to use it. You mostly need to send the right response headers.

There are two separate ideas worth keeping apart. **Freshness** decides whether a cached copy can be reused without asking the server at all. **Validation** decides how a client asks "has this changed?" when the copy is no longer fresh.

## Freshness with Cache-Control

The `Cache-Control` response header tells caches how long a response stays fresh. A few directives cover most cases:

- `max-age=3600` means the response can be reused for an hour without contacting the server.
- `no-cache` means the response may be stored, but it must be revalidated with the server before each reuse. The name is confusing, because it does not forbid caching.
- `no-store` means do not keep the response anywhere. Use it for sensitive data such as account pages.
- `private` means only the user's own browser may store it, not shared caches like a CDN.
- `public` allows shared caches to store it as well.

A common pattern for static assets is to put a content hash in the filename, for example `app.3f9a1c.js`, and serve it with a long `max-age` plus `immutable`. When the file changes, the name changes, so old copies never get in the way.

## Validation with ETags

When a cached response is stale, the client does not have to download it again blindly. The server can attach an `ETag` header, an identifier for that version of the resource, often a hash of its content. On the next request the client sends it back in an `If-None-Match` header.

If the resource has not changed, the server answers with `304 Not Modified` and an empty body. The client keeps using its copy. If it has changed, the server sends a normal `200` with the new content and a new ETag. The older alternative is `Last-Modified` with `If-Modified-Since`, which works on timestamps instead of identifiers.

A `304` still costs a round trip, but it saves the transfer of the body. For large JSON payloads that adds up quickly.

## Using it in an API

For a read endpoint, a simple approach is to compute an ETag from the response body or from a version number stored with the record. Compare it with the incoming `If-None-Match`, and return `304` when they match. Many frameworks and reverse proxies can do the body-hash version for you.

ETags also help with writes. A client can send `If-Match` with the ETag it last saw when updating a record. If someone else changed the record in the meantime, the server responds with `412 Precondition Failed` instead of silently overwriting their work. This is a lightweight form of optimistic locking.

## Things to watch out for

- Responses that depend on who is asking need `private` or `no-store`, otherwise a shared cache could serve one user's data to another.
- If the response varies by a request header such as `Accept-Language`, send a `Vary` header so caches keep separate copies.
- Be careful with long `max-age` values on URLs that do not change when the content does. There is no reliable way to pull a response back out of every browser once it is cached.

Start with sensible headers on your static files, then add ETags to your heaviest read endpoints. It is one of the cheapest performance wins available on the web.
