---
title: "Hardening a Docker container at runtime: read-only, no root, fewer capabilities"
description: "Run containers with a read-only root filesystem, a non-root user, dropped Linux capabilities and no-new-privileges, using docker run flags and Compose."
date: 2026-11-27
tags: [docker, security, linux, containers]
lang: en
---

## Defaults are built for convenience

A plain `docker run` gives a container more than most applications need. Unless the image says otherwise, the process runs as root inside the container, it can write anywhere in its own filesystem, and it keeps Docker's default set of Linux capabilities, such as `CHOWN`, `SETUID`, `NET_RAW` and `NET_BIND_SERVICE`. None of that is a disaster on its own, because the container is still isolated by namespaces and cgroups. But if someone finds a remote code execution bug in your app, those defaults decide how much room they have to move.

The good news is that most of the tightening happens at runtime, with a handful of flags. You do not need to rebuild your image to try them.

## 1. Run as a non-root user

If the image does not set a `USER`, you can choose one at runtime:

```bash
docker run --rm --user 10001:10001 myapp:latest
```

The UID does not have to exist in the image's `/etc/passwd`, but the process must be able to read its files and write to whatever paths it needs. Check what you are actually running as:

```bash
docker exec myapp id
```

Better still, bake it into the image so nobody forgets:

```dockerfile
RUN addgroup --system --gid 10001 app && adduser --system --uid 10001 --ingroup app app
USER 10001:10001
```

A numeric UID is useful because tools like Kubernetes' `runAsNonRoot` check can verify a number but not a name.

## 2. Make the root filesystem read-only

Most services never need to change their own code or libraries at runtime. Say so:

```bash
docker run --rm --read-only --tmpfs /tmp:rw,noexec,nosuid,size=64m myapp:latest
```

`--read-only` mounts the container's root filesystem read-only. Anything that genuinely needs to be written goes to a `tmpfs` (in memory, gone on restart) or a named volume (persistent). The first run usually fails with an error like `Read-only file system`, which is useful: it tells you exactly which path your app writes to. Common ones are `/tmp`, a cache directory, or a PID file under `/run`.

An attacker who gets code execution can no longer drop a modified binary into `/usr/local/bin` or edit the app's source in place.

## 3. Drop capabilities you do not use

Linux splits root's powers into capabilities. Start from zero and add back only what fails:

```bash
docker run --rm --cap-drop ALL myapp:latest
```

A typical web API listening on a port above 1024 needs no capabilities at all. If it must bind to port 80 or 443 directly, add just that one:

```bash
docker run --rm --cap-drop ALL --cap-add NET_BIND_SERVICE -p 80:80 myapp:latest
```

To see which capabilities a running process has, read its status from inside the container:

```bash
docker exec myapp grep Cap /proc/1/status
```

The `CapEff` line is a hex bitmask; `capsh --decode=<value>` (from the `libcap` tools) turns it into names. With `--cap-drop ALL` it should be all zeros.

## 4. Block privilege escalation

Even as a non-root user, a process could gain privileges through a setuid binary such as `su` or `passwd` if one exists in the image. The `no-new-privileges` option tells the kernel to refuse that:

```bash
docker run --rm --security-opt no-new-privileges:true myapp:latest
```

It costs nothing for normal applications and closes a whole category of escalation tricks.

## 5. Put limits on resources

A compromised or buggy container should not be able to starve the host. Memory, CPU and process count limits are cheap insurance:

```bash
docker run --rm --memory 256m --cpus 0.5 --pids-limit 200 myapp:latest
```

`--pids-limit` in particular stops a fork bomb from taking down everything else on the machine.

## Putting it together in Compose

Flags are fine for testing, but in practice the settings belong in your Compose file, where they are reviewed and versioned:

```yaml
services:
  api:
    image: myapp:latest
    user: "10001:10001"
    read_only: true
    tmpfs:
      - /tmp:rw,noexec,nosuid,size=64m
    cap_drop:
      - ALL
    security_opt:
      - no-new-privileges:true
    mem_limit: 256m
    cpus: 0.5
    pids_limit: 200
    ports:
      - "8080:8080"
```

Then confirm the result with `docker inspect`:

```bash
docker inspect --format '{{.Config.User}} ro={{.HostConfig.ReadonlyRootfs}} caps={{.HostConfig.CapDrop}} sec={{.HostConfig.SecurityOpt}}' <container>
```

## How I roll this out

Turning everything on at once and watching the app crash is not much fun. I add one setting at a time in this order: non-root user, `no-new-privileges`, `--cap-drop ALL`, then `--read-only` with tmpfs mounts for whatever paths break. After each step I run the app's health check and a quick smoke test. Usually only the read-only step needs real work, and it is almost always one or two writable directories.

## What this does not cover

Runtime flags reduce the damage after something goes wrong. They do not replace keeping base images patched, scanning images for known vulnerabilities, keeping secrets out of environment variables where possible, or not mounting `/var/run/docker.sock` into containers, which effectively hands out root on the host. Hardening is layers, and these flags are one of the cheapest layers to add.
