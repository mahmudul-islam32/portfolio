# syntax=docker/dockerfile:1
# Stages: deps → source (for dockerized `npm run build` with bind-mounted ./build) → builder → production (nginx)

FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install --no-audit --no-fund --prefer-offline

FROM deps AS source
COPY . .

FROM source AS builder
ARG REACT_APP_STRAPI_URL=http://localhost:1337
ENV REACT_APP_STRAPI_URL=$REACT_APP_STRAPI_URL \
    CI=true
RUN npm run build

FROM nginx:1.25-alpine AS production
COPY nginx.default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
