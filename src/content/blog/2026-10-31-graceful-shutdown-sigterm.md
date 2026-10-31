---
title: "Graceful shutdown: handling SIGTERM without dropping requests"
description: "Every deploy stops your old processes. Here is how to handle SIGTERM so in-flight requests finish, connections close cleanly and users never notice."
date: 2026-10-31
tags: [backend, devops, reliability, docker]
lang: en
---

## Every deploy is a shutdown

We spend a lot of time thinking about how services start and very little about how they stop. Yet every deploy, scale-down and node drain ends with your process being told to exit. If it exits the wrong way, requests that were halfway through get cut off, background jobs stop mid-write and clients see errors that have nothing to do with a bug in your code.

Graceful shutdown means the process stops taking new work, finishes what it already started, releases its resources and then exits on its own.

## How the stop signal works

On Linux, the polite way to ask a process to stop is the `SIGTERM` signal. The process can catch it and clean up. If it is still running after a grace period, the platform sends `SIGKILL`, which cannot be caught and ends the process immediately.

Both Docker and Kubernetes follow this pattern. `docker stop` sends `SIGTERM` and waits 10 seconds by default before killing the container. Kubernetes sends `SIGTERM` to the containers in a pod and waits for `terminationGracePeriodSeconds`, which defaults to 30 seconds. Your job is to finish cleanly inside that window.

## The shutdown sequence

A good handler does roughly this, in order:

1. **Stop accepting new work.** Close the listening socket or stop pulling from the queue.
2. **Tell the load balancer.** In Kubernetes, start failing the readiness probe so the pod is removed from the service endpoints.
3. **Finish in-flight work.** Let open requests complete, with a timeout shorter than the grace period.
4. **Release resources.** Flush logs and metrics, close database pools and message broker connections.
5. **Exit with code 0.**

## An example in Node.js

```js
const server = app.listen(3000);
let shuttingDown = false;

process.on('SIGTERM', () => {
  shuttingDown = true;               // readiness endpoint can now return 503
  server.close(async () => {         // stops new connections, waits for open ones
    await db.end();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 25_000).unref(); // safety net before SIGKILL
});
```

The timeout matters. Long-lived connections such as keep-alive sockets or WebSockets can keep `server.close()` waiting forever, so you want a hard limit that still fits inside the platform's grace period.

In Python, servers such as Uvicorn and Gunicorn already handle `SIGTERM` by letting current requests finish. With FastAPI, the place for your own cleanup is the lifespan handler: code after the `yield` runs during shutdown, which is where you close clients and pools.

## The PID 1 trap in containers

A common reason graceful shutdown "does not work" in Docker is that the signal never reaches your application. If a Dockerfile uses the shell form, such as `CMD npm start` or `CMD python app.py`, the command runs under `/bin/sh -c`. The shell becomes PID 1 and does not forward `SIGTERM` to its child, so your handler never runs and the container is killed after the timeout.

Use the exec form instead, `CMD ["node", "server.js"]`, so your process is PID 1 and receives the signal directly. If you need a wrapper script, end it with `exec` so the app replaces the shell. Running a small init such as `tini` (or `docker run --init`) also helps with signal forwarding and reaping zombie processes.

## Watch out for the routing race

Even with a perfect handler, there is a short window in Kubernetes where the pod has received `SIGTERM` but some proxies still send it traffic, because removing endpoints is asynchronous. A common fix is a `preStop` hook that sleeps for a few seconds, giving the network time to catch up before the process stops listening.

## Test it

The easiest check is to run a load test, trigger a deploy and count errors. Zero failed requests during a rollout is a realistic goal, and graceful shutdown is most of what it takes to get there.
