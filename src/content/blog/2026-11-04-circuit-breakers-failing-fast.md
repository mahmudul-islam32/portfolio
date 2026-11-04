---
title: "Circuit breakers: failing fast when a dependency is down"
description: "When a downstream service is struggling, waiting on it makes things worse. A circuit breaker stops calling it for a while so both sides can recover."
date: 2026-11-04
tags: [backend, reliability, architecture]
lang: en
---

## The problem with waiting

Retries with backoff handle brief hiccups well. They do not help when a dependency is properly down. If the payment service takes thirty seconds to time out on every call, each request to your API holds a worker, a connection and some memory for those thirty seconds. Soon your own service runs out of workers, and an outage in one place becomes an outage everywhere that depends on it.

A circuit breaker is the pattern for this situation. It wraps calls to a dependency, watches how they go, and when failures pile up it stops making the calls for a while. Instead of waiting for a timeout, callers get an error immediately. The idea was popularised by Michael Nygard's book *Release It!* and is now built into most resilience libraries.

## Three states

A breaker is a small state machine:

- **Closed.** Calls go through as normal. The breaker counts failures, such as timeouts, connection errors and 5xx responses.
- **Open.** Once failures cross a threshold, the breaker opens. Every call fails at once without touching the dependency. This protects your threads and gives the struggling service room to recover.
- **Half-open.** After a cool-down period, the breaker lets a few trial calls through. If they succeed, it closes again. If they fail, it goes back to open and the timer restarts.

The thresholds are usually expressed as a failure rate over a sliding window, for example "open if more than half of the last 20 calls failed", plus a minimum number of calls so that two failures out of two do not trip it during a quiet night.

## A minimal version

```python
import time

class CircuitBreaker:
    def __init__(self, max_failures=5, reset_after=30.0):
        self.max_failures = max_failures
        self.reset_after = reset_after
        self.failures = 0
        self.opened_at = None

    def call(self, fn, *args, **kwargs):
        if self.opened_at is not None:
            if time.monotonic() - self.opened_at < self.reset_after:
                raise RuntimeError("circuit open")
            # cool-down over: half-open, allow this call as a trial
        try:
            result = fn(*args, **kwargs)
        except Exception:
            self.failures += 1
            if self.opened_at is not None or self.failures >= self.max_failures:
                self.opened_at = time.monotonic()
            raise
        self.failures = 0
        self.opened_at = None
        return result
```

This counts consecutive failures rather than a rate and is not thread-safe, but it shows the shape. In production, reach for a maintained library instead: Resilience4j on the JVM, Polly in .NET, opossum in Node.js or pybreaker in Python.

## What to do when the circuit is open

Failing fast is only half the value. The other half is deciding what the caller gets instead. Depending on the feature, that can be a cached value, a default (an empty list of recommendations), a queued job that runs later, or a clear error that the frontend can show. A product page that loads without reviews is better than one that does not load.

## Things that trip people up

- **One breaker per dependency**, not one global breaker. A slow search service should not block calls to billing.
- **Count the right errors.** A 404 or a validation error means the dependency is healthy and the request was wrong. Only count failures that say something about the service itself.
- **Set timeouts first.** A breaker learns from failures, and a call with no timeout may never fail. Short, explicit timeouts are what make the breaker useful.
- **Combine it with retries carefully.** Retries go inside the breaker's view, so a retry storm opens the circuit quickly, which is usually what you want.
- **Expose its state.** Log state changes and export them as a metric. An open breaker is an alert worth seeing.

## Takeaway

Timeouts limit how long one call can hurt you, retries recover from blips, and a circuit breaker stops you from hammering a service that is already down. Together they keep a failure in one dependency from spreading through the whole system.
