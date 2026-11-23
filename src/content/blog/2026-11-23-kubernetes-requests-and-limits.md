---
title: "Kubernetes resource requests and limits, explained with examples"
description: "What CPU and memory requests and limits actually do in Kubernetes, how they affect scheduling, throttling, OOM kills and QoS classes, and how I pick starting values."
date: 2026-11-23
tags: [kubernetes, docker, cloud, devops]
lang: en
---

## Why this matters

The first Kubernetes manifests I wrote had no `resources` block at all. Everything worked until one pod with a memory leak pushed a node into memory pressure and the kubelet started evicting unrelated pods. Requests and limits are the settings that prevent this, but they do two quite different jobs, and mixing them up leads to either wasted capacity or mysterious restarts.

## The basic block

Resources are set per container, not per pod:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - name: api
          image: ghcr.io/example/api:1.4.2
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              memory: "512Mi"
```

CPU is measured in cores: `250m` means 250 millicores, a quarter of one core. Memory uses bytes with suffixes; `Mi` and `Gi` are powers of two, while `M` and `G` are powers of ten. I stick to `Mi`/`Gi` so the numbers match what tools like `free -m` show.

## Requests: what the scheduler reserves

A request is a reservation. The scheduler only places a pod on a node whose allocatable capacity, minus the requests of pods already running there, can fit the new pod's requests. Actual usage does not matter for this decision; only the declared requests do.

That has two consequences:

- If requests are too high, nodes look full while sitting mostly idle, and new pods stay `Pending`.
- If requests are too low, the scheduler packs too many pods onto a node, and they fight over real resources at runtime.

When a pod is stuck in `Pending`, the events usually say why:

```bash
kubectl describe pod api-7c9d8f6b5-x2kqp | sed -n '/Events/,$p'
# ... 0/3 nodes are available: 3 Insufficient memory.
```

To see how much of each node is already promised:

```bash
kubectl describe node worker-1 | sed -n '/Allocated resources/,/Events/p'
```

CPU requests also matter at runtime: when the CPU is contended, containers get CPU time roughly in proportion to their requests.

## Limits: what the kubelet enforces

Limits are a ceiling enforced through Linux cgroups, and CPU and memory behave very differently when the ceiling is hit.

**CPU limit:** the container is throttled. It is not killed; it just gets less CPU time in each scheduling period. For a latency-sensitive service this shows up as slow requests with no errors in the logs, which is hard to diagnose.

**Memory limit:** memory cannot be throttled, so when a container tries to use more than its limit, the kernel's OOM killer terminates a process in it. Kubernetes reports this as:

```bash
kubectl get pod api-7c9d8f6b5-x2kqp \
  -o jsonpath='{.status.containerStatuses[0].lastState.terminated.reason}'
# OOMKilled
```

The container then restarts according to the pod's restart policy, and repeated OOM kills end up in `CrashLoopBackOff`.

This is why my default example above sets a memory limit but no CPU limit. A memory limit protects the node from a leak. A CPU limit mostly protects other workloads from a busy neighbour, and CPU requests already give each container its fair share under contention. Whether to set CPU limits is a team decision; on shared clusters some platforms require them, and that is fine as long as you know throttling is the trade-off.

## QoS classes

Based on requests and limits, Kubernetes assigns each pod a Quality of Service class, which decides who gets evicted first when a node runs low on memory:

- **Guaranteed:** every container has CPU and memory requests and limits, and requests equal limits.
- **Burstable:** at least one container has a CPU or memory request or limit, but the pod does not meet the Guaranteed rules.
- **BestEffort:** no container has any requests or limits.

Under node memory pressure, BestEffort pods are evicted first, then Burstable pods using more than their requests. You can check the class directly:

```bash
kubectl get pod api-7c9d8f6b5-x2kqp -o jsonpath='{.status.qosClass}'
```

One detail that surprised me: if you set a limit but no request, Kubernetes copies the limit into the request. So `limits.memory: 1Gi` alone also reserves 1Gi on the node.

## Choosing starting values

I do not guess numbers from thin air. My process is:

1. Run the service under realistic load in a staging namespace without tight limits.
2. Watch actual usage. With metrics-server installed:

   ```bash
   kubectl top pod -l app=api --containers
   ```

   For anything longer than a quick look, I use Prometheus and the `container_memory_working_set_bytes` and `container_cpu_usage_seconds_total` metrics.
3. Set the memory request near typical working-set usage, and the memory limit with headroom above the observed peak.
4. Set the CPU request around typical usage under normal load.
5. Revisit after real traffic, because usage changes as the code changes.

For runtimes with their own heap settings, make them agree with the limit. A JVM or Node.js process that thinks it can use more memory than its container limit will be OOM-killed instead of collecting garbage earlier.

## Defaults per namespace

To avoid BestEffort pods sneaking in, a `LimitRange` can apply defaults to containers that do not declare resources:

```yaml
apiVersion: v1
kind: LimitRange
metadata:
  name: defaults
  namespace: apps
spec:
  limits:
    - type: Container
      defaultRequest:
        cpu: "100m"
        memory: "128Mi"
      default:
        memory: "256Mi"
```

`defaultRequest` fills in requests and `default` fills in limits. Combined with a `ResourceQuota` on the namespace, this keeps one team's deployments from quietly consuming a whole cluster.

## Summary

Requests are for scheduling and fair sharing; limits are hard ceilings. A CPU limit throttles, a memory limit kills. Set requests on everything, set memory limits based on measured usage, think carefully before adding CPU limits, and check the QoS class of anything important. That small `resources` block is one of the cheapest reliability improvements in a Kubernetes setup.
