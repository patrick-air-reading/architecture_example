# syntax=docker/dockerfile:1
# Build context: repository root (see docker-compose.yml).

FROM node:24-alpine AS base
ENV TURBO_TELEMETRY_DISABLED=1
WORKDIR /repo

# 1. Prune the monorepo to just @edu/web and its workspace dependencies.
FROM base AS pruner
COPY . .
RUN npx --yes turbo@2.11.5 prune @edu/web --docker

# 2. Install (cached on package.json/lockfile changes only), then build.
FROM base AS builder
COPY --from=pruner /repo/out/json/ .
RUN npm ci
COPY --from=pruner /repo/out/full/ .
# turbo prune only copies package files, so bring the shared compiler config along.
COPY tsconfig.base.json .
RUN npx turbo run build --filter=@edu/web

# 3. Serve the static bundle with nginx, which also proxies /api to the API container.
FROM nginx:1.29-alpine AS runner
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /repo/apps/web/dist /usr/share/nginx/html
EXPOSE 80
