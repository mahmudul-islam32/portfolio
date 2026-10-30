---
title: "Structured logging: why your logs should be JSON"
description: "Plain text logs are easy to write and hard to search. Here is how structured logs with consistent fields make debugging production services faster."
date: 2026-10-30
tags: [backend, observability, python, devops]
lang: en
---

## The problem with plain text logs

Most services start with log lines like `User 42 failed to log in from 10.0.0.7`. That reads fine in a terminal. It gets painful once the service runs on several machines and you need to answer a question such as "which users failed to log in more than five times in the last hour?". Now you are writing regular expressions against free-form sentences, and every developer phrased their messages a little differently.

Structured logging fixes this by treating each log entry as data instead of a sentence. Instead of one string, you emit an event with named fields:

```json
{"ts": "2026-10-30T09:14:02Z", "level": "warning", "event": "login_failed", "user_id": 42, "ip": "10.0.0.7"}
```

Your log platform can index those fields, so the question above becomes a simple filter and count instead of a text search.

## Pick a small set of standard fields

The value of structured logs comes from consistency. Agree on a few fields that every service always writes:

- `ts`: a timestamp in UTC, in ISO 8601 format.
- `level`: debug, info, warning, error.
- `event`: a short, stable name such as `order_created`, not a full sentence.
- `service` and `env`: which service and which environment wrote the line.
- `request_id` or `trace_id`: an identifier that ties together every line from one request.

The request identifier is the one people skip and later regret. When a request passes through an API gateway, two services and a background worker, a shared ID is what lets you follow it from start to finish.

## Doing it in Python

The standard `logging` module can produce JSON with a custom formatter, and libraries such as `structlog` make it more pleasant. The core idea is the same either way: bind context once and let every later log call include it.

```python
import structlog

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso", utc=True),
        structlog.processors.JSONRenderer(),
    ]
)

log = structlog.get_logger()

def handle_request(request_id: str, user_id: int):
    structlog.contextvars.bind_contextvars(request_id=request_id, user_id=user_id)
    log.info("checkout_started")
    log.info("payment_authorized", amount_cents=1999)
```

Both lines carry `request_id` and `user_id` without repeating them. In a web framework you would bind the request ID in a middleware and clear the context at the end of the request.

## Things to avoid

**Secrets and personal data.** Logs are copied to many places and kept for a long time. Never log passwords, tokens or full card numbers, and think twice before logging email addresses. A small processor that drops or masks known sensitive keys is cheap insurance.

**Unbounded field names.** Putting values into keys, for example `{"user_42": "failed"}`, creates a new field for every user and can overload your log index. Keep keys fixed and put the variable part in the value.

**Logging everything at info.** If every function logs on entry and exit, the useful lines drown. Log business events and errors at info and above, and keep detailed tracing at debug so you can turn it on when needed.

## Readable locally, structured in production

JSON is not fun to read while developing. Most libraries let you switch renderers, so you can print colourful, human-friendly lines on your laptop and JSON in production, controlled by an environment variable. You get the comfort of plain text where you read logs by eye, and searchable data where machines do the reading.

Structured logging is a small change to make early and an expensive one to retrofit later. If you are starting a new service, set up the formatter and the request ID on day one.
