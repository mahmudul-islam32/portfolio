---
title: "Verifying webhook signatures with HMAC"
description: "A webhook endpoint is a public URL anyone can call. Checking an HMAC signature over the raw body proves the request came from the sender and was not changed."
date: 2026-11-11
tags: [security, api-design, backend]
lang: en
---

## A public URL that changes your data

A webhook is a provider calling you: a payment succeeded, a repository got a push, a subscription was cancelled. To make that work, you give the provider a URL, and that URL has to be reachable from the internet.

That also means anyone who finds it can send it a request. If your handler marks an order as paid whenever a `payment_succeeded` event arrives, an attacker only needs to guess the URL and the shape of the JSON. Hiding the URL is not a defence. It ends up in logs, config files and screenshots.

## How HMAC signing works

Most providers solve this with a shared secret and an HMAC. When you register the endpoint, the provider gives you a signing secret. For every delivery, it computes `HMAC-SHA256(secret, payload)` and sends the result in a header. You compute the same value on your side and compare.

An HMAC is a keyed hash. Without the secret, nobody can produce a valid signature for a body, and changing even one byte of the body changes the signature completely. So a matching signature tells you two things: the request came from someone who knows the secret, and the body is exactly what they signed.

Stripe, for example, sends a `Stripe-Signature` header with a timestamp `t` and a signature `v1`, where the signed string is the timestamp, a dot, and the raw body. GitHub sends `X-Hub-Signature-256` with `sha256=` followed by the hex digest of the body. The details differ, so read your provider's docs, but the idea is the same.

## Verify the raw body

The most common bug is verifying the wrong bytes. The signature covers the body exactly as it was sent. If your framework has already parsed the JSON and you serialise it again, key order, spacing or number formatting can change, and the signature will not match.

Read the raw request body first, verify it, and only then parse it:

```python
import hmac, hashlib, time

TOLERANCE_SECONDS = 300

def verify(raw_body: bytes, timestamp: str, signature: str, secret: str) -> bool:
    if abs(time.time() - int(timestamp)) > TOLERANCE_SECONDS:
        return False
    signed = timestamp.encode() + b"." + raw_body
    expected = hmac.new(secret.encode(), signed, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)
```

In FastAPI that means `await request.body()` instead of a Pydantic model parameter. In Express it means a raw body parser on the webhook route. If the provider has an official library with a verify function, prefer it; it already handles the header format.

## Compare in constant time

A plain `==` on strings can stop at the first differing character, so the time it takes leaks how much of a guess was right. Over many requests that can be measured. `hmac.compare_digest` in Python and `crypto.timingSafeEqual` in Node take the same time no matter where the difference is. It is a one-line change, so there is no reason to skip it.

## Reject old deliveries

A valid signature does not stop someone from capturing a real request and sending it again later. That is why schemes like Stripe's include a timestamp in the signed string: you reject anything older than a few minutes, and the attacker cannot change the timestamp without breaking the signature.

Within that window a replay is still possible, and providers themselves retry deliveries that failed. Store the event id and ignore ids you have already processed, the same idea as an [idempotency key](/blog/2026-10-23-idempotent-apis-safe-retries/).

## A short checklist

- Keep the signing secret in configuration, never in the code, and support two secrets for a while when you rotate it.
- Verify before you do anything else, and return `400` without details when it fails.
- Respond quickly with `2xx` and do slow work in the background, so the provider does not time out and retry.
- Log failed verifications. A sudden burst usually means a wrong secret after a deploy, not an attack.

Webhooks are convenient because they push data to you. Signature checks make sure the data you act on was really pushed by the provider you trust.
