---
title: "Typed configuration in FastAPI with pydantic-settings"
description: "Load and validate environment variables once, fail fast on bad config, and keep secrets out of your code: a small pattern I use in every FastAPI service."
date: 2026-10-22
tags: [python, fastapi, backend]
lang: en
---

Reading `os.environ` all over a codebase works until a typo in a variable name reaches production. A single typed settings object fixes that.

## The settings class

```python
from functools import lru_cache
from pydantic import PostgresDsn, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="APP_")

    database_url: PostgresDsn
    stripe_api_key: SecretStr
    debug: bool = False


@lru_cache
def get_settings() -> Settings:
    return Settings()
```

If `APP_DATABASE_URL` is missing or isn't a valid Postgres URL, the service refuses to start. That's what you want: a crash at boot is much cheaper than a crash at 2 a.m.

## Using it in a route

```python
from fastapi import Depends, FastAPI

app = FastAPI()

@app.get("/health")
def health(settings: Settings = Depends(get_settings)):
    return {"debug": settings.debug}
```

Because it's a dependency, tests can override it without touching environment variables:

```python
app.dependency_overrides[get_settings] = lambda: Settings(
    database_url="postgresql://test@localhost/test",
    stripe_api_key="sk_test_123",
)
```

## Why `SecretStr`

`SecretStr` prints as `**********` in logs and tracebacks. You call `.get_secret_value()` only at the one place that needs the real key.

Small pattern, but it removes a whole class of "works on my machine" bugs.
