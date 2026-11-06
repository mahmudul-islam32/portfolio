---
title: "Correlation IDs: following a request across services"
description: "When a request hops through a gateway, a few services and a worker, a shared ID is what lets you reconstruct what happened. Here is a simple way to pass one."
date: 2026-11-06
tags: [backend, observability, reliability]
lang: en
---

## The trail goes cold at the next service

A user reports that checkout failed. You open the API gateway logs and find a 502. The order service logged nothing useful for that second. The payment service has an error, but you cannot tell whether it belongs to this request or to one of the dozens that failed around the same time. Each service has logs; none of them share a key that ties the trail together.

A correlation ID (also called a request ID or trace ID at this simple level) fixes that. The first component that sees the request assigns an ID, every later component copies it into its logs and into outbound calls, and you can filter on that one value end to end.

## Where the ID comes from

Generate the ID at the edge, usually the API gateway or the first service behind it. A UUID version 4 is fine. Prefer accepting an ID the client already sent in a header such as `X-Request-ID` or `X-Correlation-ID` when it is present and well-formed, and generate one only when it is missing. That lets a browser, a mobile app or an upstream partner keep using the same ID they already have in their own logs.

```python
import uuid
from fastapi import Request, Response

HEADER = "X-Request-ID"

async def correlation_middleware(request: Request, call_next):
    request_id = request.headers.get(HEADER) or str(uuid.uuid4())
    request.state.request_id = request_id
    response: Response = await call_next(request)
    response.headers[HEADER] = request_id
    return response
```

Putting the same value on the response helps the caller. If something goes wrong, support can ask the user for the ID from the response headers or from an error page, and you search for it directly.

## Pass it on every hop

Inside the process, bind the ID to the request context so every log line includes it without each call site repeating the argument. When you call another service, copy the header onto the outbound request. The same rule applies to jobs you enqueue: store the ID on the message and restore it when the worker starts, otherwise the trail ends when the HTTP request returns and the background work begins.

```python
import httpx

async def call_inventory(request_id: str, sku: str):
    headers = {HEADER: request_id}
    async with httpx.AsyncClient() as client:
        return await client.get(f"http://inventory/items/{sku}", headers=headers)
```

If you already emit [structured JSON logs](/blog/2026-10-30-structured-logging-json/), add `request_id` as a standard field. Filtering then becomes a single query across every service that handled that checkout.

## Keep the contract boring

Agree on one header name and stick to it. Reject or replace values that are empty, extremely long or full of unexpected characters, so a client cannot inject junk into your log index. Do not treat the ID as a secret or as proof of identity; it is an opaque handle for debugging. For deeper timing analysis across services you will eventually want a full tracing system with spans, but a plain correlation ID is enough to answer "what did we do for this request?" and you can add it in an afternoon.

## Takeaway

Assign a request ID at the edge, return it to the caller, put it on every log line and every outbound call, and carry it into async work. When the next checkout fails, you will search for one string instead of guessing across three log streams.
