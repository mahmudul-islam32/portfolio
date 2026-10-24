---
title: "Access tokens and refresh tokens: why APIs use two"
description: "A short-lived access token plus a longer-lived refresh token is a common login pattern. Here is what each one does and how to handle them safely."
date: 2026-10-24
tags: [security, authentication, backend]
lang: en
---

## The problem with one token

The simplest way to keep a user logged in to an API is to hand them one token after they sign in and check it on every request. That works, but it forces an awkward trade-off. If the token lives for a long time, anyone who steals it can use it for a long time. If it expires quickly, the user has to type their password again and again.

Splitting the job between two tokens is how most modern systems get out of that trade-off.

## What each token does

An **access token** is what the client sends with ordinary API calls, usually in an `Authorization: Bearer ...` header. It is short-lived, often somewhere between a few minutes and an hour. Because it is checked on every request, it is often a signed JWT, so a service can verify the signature and read the user id and permissions without asking a database.

A **refresh token** has one purpose: getting a new access token when the old one expires. It lives longer, sometimes days or weeks, and it is only ever sent to one endpoint on the auth server, not to every service.

The result is that the token travelling around the most is the one that becomes useless soonest.

## The refresh flow

1. The user signs in and receives both tokens.
2. The client calls the API with the access token.
3. When the API answers with `401 Unauthorized` because the token has expired, the client sends the refresh token to the auth server.
4. The auth server checks it and returns a fresh access token, and ideally a new refresh token too.
5. The client retries the original request.

Good client code does this quietly, so the user never notices.

## Rotation and revocation

A signed JWT access token is hard to revoke before it expires, because services verify it on their own. That is exactly why it should be short-lived.

Refresh tokens are different. They are usually stored on the server, or at least tracked there, so they can be revoked when a user logs out, changes their password, or an admin disables the account.

Many systems also use **refresh token rotation**: each time a refresh token is used, it is replaced by a new one and the old one stops working. If an old token ever shows up again, that is a strong sign it was stolen, and the server can end every session in that chain.

## Where to store them in a browser

There is no perfect answer, but some rules of thumb are widely followed:

- Keep the access token in memory where possible, rather than in `localStorage`, which any script on the page can read.
- Put the refresh token in an `HttpOnly`, `Secure` cookie with a sensible `SameSite` setting, so JavaScript cannot read it.
- If you rely on cookies, think about cross-site request forgery and protect the refresh endpoint accordingly.

## Practical tips

- Pick lifetimes on purpose. A 15 to 30 minute access token with a refresh token measured in days is a common starting point, not a rule.
- Keep the signing secret out of source control and share it only with the services that need to verify tokens.
- Put as little as possible inside a JWT. Anyone holding it can decode the payload, because signing is not encryption.
- Log refresh failures. A sudden spike can be the first sign of a problem.

Two tokens add a little complexity, but they let you keep sessions both convenient and reasonably safe, which is why the pattern shows up almost everywhere.
