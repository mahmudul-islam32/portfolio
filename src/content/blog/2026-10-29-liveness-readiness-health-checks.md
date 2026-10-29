---
title: "Liveness vs readiness: writing health checks that actually help"
description: "What liveness and readiness checks are for, why mixing them up causes restart loops, and how to write health endpoints that tell your platform the truth."
date: 2026-10-29
tags: [devops, kubernetes, backend, reliability]
lang: en
---

## Why health checks exist

Once a service runs behind a load balancer or on a container platform, something other than you decides whether it gets traffic and whether it should be restarted. That something needs a way to ask the service how it is doing. A health check is that question, usually an HTTP endpoint such as `/healthz` that returns 200 when things are fine and an error status when they are not.

The trouble is that "is it fine?" really hides two different questions, and Kubernetes makes the split explicit with two kinds of probes.

## Liveness: should this process be restarted?

A liveness check answers one thing: is the process stuck in a state it cannot recover from on its own? Think of a deadlock, an event loop that has stopped responding, or a worker that has wedged itself. In those cases the only fix is to kill the container and start a fresh one, and that is exactly what the platform does when the liveness probe fails repeatedly.

Because a failure leads to a restart, a liveness check should be cheap and should only look at the process itself. If the endpoint can respond at all, the process is usually alive.

## Readiness: should this instance get traffic right now?

A readiness check answers a different question: can this instance serve requests at this moment? A service that is still loading a cache, warming up a model, or running migrations is alive but not ready. When the readiness probe fails, the platform does not restart anything. It just stops routing new requests to that instance until the check passes again.

This is the right place to look at things the service needs in order to do useful work, such as whether it has finished starting up or whether it can reach its own database.

## The classic mistake

The most common bug is putting dependency checks into the liveness probe. Imagine every instance of your API pings the database in its liveness check. The database has a short hiccup, every probe fails at once, and the platform restarts every instance at the same time. Now the database comes back to a stampede of fresh processes all opening connections, and the outage is longer than the original blip.

A restart cannot fix a database that is down somewhere else, so that check does not belong in liveness. At most it belongs in readiness, and even there you should be careful: if every instance becomes unready together, you have still taken the whole service out of rotation.

## Practical guidelines

- Keep liveness trivial. Return 200 if the process can handle the request, and avoid external calls.
- Use readiness for startup and for conditions that are local to the instance.
- Give slow-starting services enough time before liveness kicks in. Kubernetes has a separate startup probe for this, which holds off the liveness check until the app has booted.
- Set timeouts and failure thresholds so that one slow response does not trigger a restart.
- Do not expose sensitive details in health responses. A status code and a short message are enough for the platform.

## Wrapping up

Health checks are small pieces of code with a large effect on how your system behaves under stress. Treat liveness as "restart me if I am broken" and readiness as "send me traffic when I can handle it", keep the two separate, and your platform will make much better decisions on your behalf.
