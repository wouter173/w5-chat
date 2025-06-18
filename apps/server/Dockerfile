FROM node:24-slim AS base
RUN apt-get update \
  && apt-get install -y \
  python3 \
  make \
  g++ \
  sqlite3 \
  libsqlite3-dev \
  && rm -rf /var/lib/apt/lists/*


WORKDIR /app

RUN npm install -g turbo@2 pnpm@9

# builder
FROM base AS builder
COPY . .

RUN turbo prune @w5-chat/server --docker

# installer
FROM base AS runner

COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .

RUN  pnpm turbo run build

CMD ["pnpm", "start"]
