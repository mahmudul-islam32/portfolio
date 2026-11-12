---
title: "CORS and preflight requests, explained"
description: "Why the browser blocks a call to your own API, what a preflight OPTIONS request is, and how to configure CORS without opening it to every site."
date: 2026-11-12
tags: [security, api-design, backend, http]
lang: en
---

## The error everyone meets once

You build a frontend on `http://localhost:3000` and an API on `http://localhost:8000`. The API works in curl and in Postman, but the browser console says the request was blocked by CORS policy. Nothing is wrong with the API. The browser is doing its job.

## Same origin, different origin

Browsers follow the same-origin policy: a script loaded from one origin cannot freely read responses from another. An origin is the combination of scheme, host and port, so `https://mdislam.dev` and `https://api.mdislam.dev` are different origins, and so are two ports on `localhost`.

Without this rule, any page you visit could call your bank's API in the background with your cookies and read the answer. CORS, Cross-Origin Resource Sharing, is the way for a server to say that a specific other origin is allowed to read its responses. The server opts in with response headers, and the browser enforces them.

## Simple requests

Some requests are sent straight away. A `GET`, `HEAD` or `POST` with only basic headers, and for `POST` a content type of `application/x-www-form-urlencoded`, `multipart/form-data` or `text/plain`, goes to the server as usual. The browser then looks at the response. If it contains `Access-Control-Allow-Origin` with the calling origin (or `*`), your JavaScript gets the response. If not, the browser hides it.

Note what that means: the request still reached the server and ran. CORS decides whether the page may read the answer, not whether the server receives the request.

## Preflight requests

Anything outside those rules triggers a preflight. That includes `PUT`, `PATCH` and `DELETE`, a JSON body with `Content-Type: application/json`, and custom headers such as `Authorization`. So in practice almost every call from a modern frontend to an API is preflighted.

Before the real request, the browser sends an `OPTIONS` request that asks for permission:

```http
OPTIONS /orders/42 HTTP/1.1
Origin: https://app.example.com
Access-Control-Request-Method: PATCH
Access-Control-Request-Headers: authorization, content-type
```

The server answers with what it allows:

```http
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.example.com
Access-Control-Allow-Methods: GET, POST, PATCH, DELETE
Access-Control-Allow-Headers: authorization, content-type
Access-Control-Max-Age: 600
```

Only if the answer covers the method and headers does the browser send the real `PATCH`. `Access-Control-Max-Age` lets the browser cache that answer for a number of seconds so it does not preflight every call; browsers cap the value, Chromium at two hours.

A common bug is an auth middleware that rejects the `OPTIONS` request with `401` because it has no token. The browser never sends credentials on a preflight, so let `OPTIONS` through before authentication runs.

## Cookies and credentials

By default, cross-origin `fetch` does not send cookies. With `credentials: 'include'` it does, but then the rules get stricter: the response must contain `Access-Control-Allow-Credentials: true`, and `Access-Control-Allow-Origin` must name the exact origin. A wildcard `*` is not accepted together with credentials.

If you echo the request's `Origin` header back from an allowlist, also send `Vary: Origin`, so a cache never serves a response meant for one origin to another.

## Configuring it in FastAPI

Most frameworks have middleware for this. In FastAPI:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://app.example.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)
```

Keep the list of origins in configuration, so staging and production can differ without code changes. If the frontend needs to read a custom response header, such as a request id, list it in `Access-Control-Expose-Headers`; otherwise JavaScript only sees a small set of basic headers.

## What CORS is not

CORS is not a firewall. Curl, scripts and other servers ignore it completely, because it only exists in browsers. It also does not stop cross-site request forgery on its own, since simple requests still reach the server. Your API still needs real authentication and authorisation on every endpoint.

Think of CORS as the browser asking your server one question: may this page read your answer? Answer it with a short, explicit allowlist rather than `*`, and the error turns into a feature that protects your users.
