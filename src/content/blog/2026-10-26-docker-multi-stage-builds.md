---
title: "Smaller Docker images with multi-stage builds"
description: "How multi-stage Dockerfiles keep compilers and dev dependencies out of your final image, with a simple Node example and a few habits that help."
date: 2026-10-26
tags: [docker, devops, containers]
lang: en
---

## The problem with one big stage

A typical first Dockerfile starts from a full base image, installs every dependency, copies the source, builds it and runs it. It works, but the final image carries everything that was needed along the way: compilers, package manager caches, dev dependencies, test tools and the raw source. None of that is needed to run the app, and all of it makes the image slower to pull and gives attackers more to work with.

Multi-stage builds solve this by letting one Dockerfile describe several stages. You build in one stage and copy only the finished output into a clean final stage.

## A simple example

Here is a frontend that is built with Node and served as static files by nginx:

```dockerfile
# Stage 1: build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: serve
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

The first stage has Node, `node_modules` and the source code. The second stage starts fresh from `nginx:alpine` and only receives the `dist` folder through `COPY --from=build`. When the build finishes, only the last stage becomes the image you tag and ship. The build stage is thrown away, apart from what Docker keeps in its layer cache.

The same idea works for compiled languages. A Go service can be built in a `golang` image and the single binary copied into a minimal base. A Python service can install wheels in one stage and copy the installed packages into a slim runtime image.

## Order your layers for the cache

Docker caches each instruction as a layer and reuses it if nothing it depends on has changed. That is why the example copies `package.json` and the lock file before the rest of the source. Dependencies change rarely, so `npm ci` can stay cached while you edit code. If you copy everything first, any small change to a source file forces a full reinstall.

## Habits that help

- **Name your stages.** `AS build` is easier to read than `--from=0`, and it keeps working if you add a stage above it.
- **Build a single stage when you need it.** `docker build --target build .` stops at the named stage, which is handy for running tests in CI with the full toolchain.
- **Use a `.dockerignore` file.** Leave out `node_modules`, `.git`, local `.env` files and build output, so they are not sent to the build context or copied by accident.
- **Do not bake secrets into any stage.** Even if a secret only lives in the build stage, it can end up in the cache or the build history. Pass build-time secrets with BuildKit secret mounts and runtime secrets through environment variables or a secrets manager.
- **Run as a non-root user** in the final stage when the base image supports it.

## Wrapping up

Multi-stage builds cost almost nothing to adopt. You keep one Dockerfile, the build stays reproducible, and the image you deploy only contains what the app needs to run. For most projects that means faster pulls, quicker deploys and a smaller attack surface, all from adding a second `FROM` line.
