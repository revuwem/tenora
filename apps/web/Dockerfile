# ---- dev: install deps only; source is bind-mounted by docker-compose.dev.yml ----
# Build with `--target dev`. The default (last) stage below is the production runtime.
# Real Node (same major as the prod runtime) plus the bun binary for installs/scripts.
FROM node:20-slim AS dev

COPY --from=oven/bun:1 /usr/local/bin/bun /usr/local/bin/bun

WORKDIR /app

COPY package.json bun.lock turbo.json ./
COPY apps ./apps
COPY packages ./packages

RUN bun install --frozen-lockfile

WORKDIR /app/apps/web

ENV NODE_ENV=development
ENV PORT=3000

EXPOSE 3000

CMD ["bun", "run", "dev"]


# ---- prod: build ----
FROM oven/bun:1 AS builder

WORKDIR /app

# Install dependencies with Bun using the existing lockfile
COPY package.json bun.lock turbo.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps ./apps
COPY packages ./packages

RUN bun install --frozen-lockfile

# Build only the web app (Next.js)
RUN bunx turbo run build --filter=web...


FROM node:20-slim AS runtime

WORKDIR /app/apps/web

# Bun workspaces keep per-app dependency symlinks in apps/web/node_modules that point
# into the root node_modules/.bun store, so both must be copied with the same layout.
# Workspace packages (@tenora/*) are symlinked from there too.
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/packages /app/packages
COPY --from=builder /app/apps/web/node_modules ./node_modules
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/next.config.ts ./next.config.ts
COPY --from=builder /app/apps/web/package.json ./package.json

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start"]

