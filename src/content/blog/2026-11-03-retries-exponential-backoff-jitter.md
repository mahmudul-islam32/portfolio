---
title: "Retrying failed requests with exponential backoff and jitter"
description: "A retry loop can rescue a request or take down a struggling service. Here is how to retry with backoff, jitter and a budget so it does the first."
date: 2026-11-03
tags: [api-design, backend, reliability]
lang: en
---

## Why naive retries make things worse

Networks drop packets, pods restart and databases hit brief lock waits. Retrying a failed request is often the right call, because the second attempt usually succeeds. The trouble is how most retry loops are written: fail, retry immediately, fail again, retry immediately.

If a service is slow because it is overloaded, every client retrying at once multiplies its load at the worst moment. A short blip turns into an outage that keeps itself going, because the retries never give the service room to recover.

## Exponential backoff

The first fix is to wait longer after each failure. With exponential backoff, the delay doubles every attempt: 100 ms, 200 ms, 400 ms, 800 ms, and so on. Add a cap so the wait never grows past something sensible, such as a few seconds for a user-facing call.

```python
import random
import time

def call_with_retries(fn, attempts=5, base=0.1, cap=5.0):
    for attempt in range(attempts):
        try:
            return fn()
        except TransientError:
            if attempt == attempts - 1:
                raise
            delay = min(cap, base * 2 ** attempt)
            time.sleep(random.uniform(0, delay))
```

## Jitter: don't retry in lockstep

Backoff alone still has a problem. If a thousand clients fail at the same moment, they all wait exactly 100 ms and retry together, then all wait 200 ms and retry together again. The spikes just get further apart.

Jitter adds randomness to the delay so retries spread out. The example above uses "full jitter": instead of sleeping for the computed delay, it sleeps for a random time between zero and that delay. It looks odd at first, but it smooths the load out far better than a fixed schedule, and it is simple to implement.

## Only retry what can succeed

Not every error deserves a second try. A good rule of thumb:

- **Retry** timeouts, dropped connections, `429 Too Many Requests` and `503 Service Unavailable`.
- **Don't retry** `400`, `401`, `403`, `404` or validation errors. The same request will fail the same way.
- **Respect `Retry-After`.** If the server tells you when to come back, use that instead of your own guess.

Retrying is also only safe when the operation is. A `GET` can be repeated freely, but a `POST` that creates an order needs an idempotency key, or a lost response followed by a retry creates a duplicate.

## Put a budget on it

Retries multiply across layers. If a frontend retries three times, and the API it calls retries three times against a database, one user action can become nine queries during an incident. Two habits keep that in check:

- **Retry at one layer**, usually the one closest to the user, and let the inner layers fail fast.
- **Use a deadline, not just a count.** If the whole request must answer within two seconds, stop retrying when that time is spent, whatever the attempt number.

Some systems go further with a retry budget, allowing retries only while they stay under a small share of total traffic. When most calls are failing, the budget runs out and clients stop adding fuel. A [circuit breaker](/blog/2026-11-04-circuit-breakers-failing-fast/) takes the same idea one step further and stops calling the failing service altogether for a while.

## Takeaway

A retry is a bet that the next attempt will go better. Make it a good bet: wait longer each time, add jitter, skip errors that cannot recover, and stop when the deadline or budget says so.
