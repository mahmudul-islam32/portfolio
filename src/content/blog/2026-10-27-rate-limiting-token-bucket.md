---
title: "Rate limiting APIs with the token bucket algorithm"
description: "How the token bucket works, why it handles bursts better than a fixed window, and what to think about when you run it across several servers."
date: 2026-10-27
tags: [api-design, backend, redis, architecture]
lang: en
---

## Why rate limit at all

Any public API will eventually meet a client that sends far more requests than you planned for. Sometimes it is an attacker, but more often it is a buggy retry loop or a script someone forgot to throttle. A rate limiter protects your service, your database and your other users by saying "not right now" before the expensive work starts.

## The simple approach and its weak spot

The easiest limiter is a fixed window: count requests per client per minute and reject anything above the limit. It is easy to build with a counter that expires after sixty seconds.

The problem is the edge between windows. A client allowed 100 requests per minute can send 100 at 12:00:59 and another 100 at 12:01:00. Both windows look fine, but your server just took 200 requests in about a second.

## How a token bucket works

The token bucket smooths this out with two numbers: a capacity and a refill rate.

- Each client has a bucket that holds up to `capacity` tokens.
- Tokens are added at a steady rate, for example 10 per second, until the bucket is full.
- Every request takes one token. If the bucket is empty, the request is rejected or delayed.

This gives you two useful properties at once. The refill rate sets the long-term average a client can sustain, and the capacity sets how big a burst you are willing to absorb. A user who opens a dashboard that fires 20 calls at once is fine, while a script hammering the endpoint all day is held to the steady rate.

You also don't need a timer that adds tokens in the background. Store the token count and the time of the last update. When a request arrives, work out how much time has passed, add `elapsed * rate` tokens (capped at the capacity), then try to take one. The whole calculation happens lazily on each request.

## Running it on more than one server

On a single process, a dictionary in memory is enough. As soon as you have several instances behind a load balancer, each one only sees part of the traffic, so the limits stop meaning much.

A common fix is to keep the bucket state in a shared store such as Redis. The important detail is that reading the count, refilling and taking a token must happen as one atomic step, otherwise two servers can read the same value and both let a request through. In Redis this is usually done with a small Lua script, which runs atomically on the server.

## Telling clients what happened

A rejected request should be easy to understand. Return HTTP status `429 Too Many Requests`, and include a `Retry-After` header when you can work out how long until a token is available. Well-behaved clients can then back off instead of retrying blindly, which is the whole point.

## A few practical tips

- Decide what a "client" is: an API key, a user ID or an IP address. IP-based limits can punish many users behind one office network.
- Use different buckets for cheap and expensive endpoints. A login or search endpoint often deserves a tighter limit than a health check.
- Log rejections. A sudden rise in 429 responses tells you either someone is misbehaving or your limits are too tight.

The token bucket is small enough to write in an afternoon, but it covers most of what an API needs: a fair average rate, room for normal bursts and a clear signal when a client should slow down.
