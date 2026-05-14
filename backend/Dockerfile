# syntax=docker/dockerfile:1
FROM node:18-alpine

RUN apk add --no-cache libc6-compat python3 make g++

WORKDIR /opt/app

COPY package*.json ./

# Cache npm downloads between builds (requires BuildKit: default on Docker Desktop).
# If you still see ENOSPC, free Docker disk: Docker Desktop → Settings → Resources, or `docker system prune -a`
RUN --mount=type=cache,target=/root/.npm \
    npm install --no-audit --no-fund --prefer-offline

COPY . .

EXPOSE 1337

CMD ["npm", "run", "develop"]
