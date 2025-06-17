FROM node:24-slim AS base

WORKDIR /app

RUN npm install -g turbo@2 pnpm@9

# builder
FROM base AS builder
COPY . .

RUN turbo prune @w5-chat/server --docker

# installer
FROM base AS installer

COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .
RUN

RUN echo "Files at /app:" && find /app -type f && pnpm turbo run build

# runner
FROM base AS runner

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 server
USER server


COPY --from=installer --chown=server:nodejs /app/apps/server/dist ./

CMD ["node", "index.cjs"]
