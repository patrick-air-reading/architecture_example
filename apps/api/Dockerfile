# syntax=docker/dockerfile:1
# Build context: repository root (see docker-compose.yml).

FROM node:24-alpine AS base
# openssl is needed by Prisma's schema engine (used for migrations).
RUN apk add --no-cache openssl
ENV TURBO_TELEMETRY_DISABLED=1
WORKDIR /repo

# 1. Prune the monorepo to just @edu/api and its workspace dependencies.
FROM base AS pruner
COPY . .
RUN npx --yes turbo@2.11.5 prune @edu/api --docker

# 2. Install (cached on package.json/lockfile changes only), then build.
FROM base AS builder
COPY --from=pruner /repo/out/json/ .
RUN npm ci
COPY --from=pruner /repo/out/full/ .
# turbo prune only copies package files, so bring the shared compiler config along.
COPY tsconfig.base.json .
RUN npx turbo run build --filter=@edu/api

# 3. One-shot job: apply migrations, then seed (the seed is a no-op on a non-empty DB).
FROM builder AS migrator
WORKDIR /repo/packages/db
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed"]

# 4. Runtime: production dependencies + compiled output only.
FROM base AS runner
ENV NODE_ENV=production
COPY --from=pruner /repo/out/json/ .
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /repo/packages/common/dist packages/common/dist
COPY --from=builder /repo/packages/db/dist packages/db/dist
COPY --from=builder /repo/apps/api/dist apps/api/dist
WORKDIR /repo/apps/api
USER node
ENV PORT=4000
EXPOSE 4000
CMD ["node", "dist/index.js"]
