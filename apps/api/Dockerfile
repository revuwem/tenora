# ---- dev: install deps only; source is bind-mounted by docker-compose.dev.yml ----
# Build with `--target dev`. The default (last) stage below is the production runtime.
# Real Node (same major as the prod runtime) plus the bun binary for installs/scripts.
# procps provides `ps`, which `nest start --watch` needs to kill the old server on reload.
FROM node:20-slim AS dev

COPY --from=oven/bun:1 /usr/local/bin/bun /usr/local/bin/bun

WORKDIR /app

# Install from the manifests only, so editing source never re-runs the install.
# Keep these lines identical to the web dev stage so both images share the layer
# (which is why the apt-get step comes after the install).
# Add a line here when a new workspace package is created.
COPY package.json bun.lock turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/tsconfig/package.json packages/tsconfig/package.json
COPY packages/ui/package.json packages/ui/package.json

# The cache mount keeps bun's download cache between builds.
RUN --mount=type=cache,target=/root/.bun/install/cache \
  bun install --frozen-lockfile

RUN apt-get update \
  && apt-get install -y --no-install-recommends procps \
  && rm -rf /var/lib/apt/lists/*

COPY apps ./apps
COPY packages ./packages

WORKDIR /app/apps/api

ENV NODE_ENV=development
ENV PORT=8000

EXPOSE 8000

CMD ["bun", "run", "dev"]


# ---- prod: build ----
FROM oven/bun:1 AS builder

WORKDIR /app

# Install dependencies with Bun using the existing lockfile
COPY package.json bun.lock turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps ./apps
COPY packages ./packages

RUN bun install --frozen-lockfile

# Build only the API app (NestJS) so we get dist output
RUN bunx turbo run build --filter=api...


FROM node:20-slim AS runtime

WORKDIR /app/apps/api

# Bun workspaces keep per-app dependency symlinks in apps/api/node_modules that point
# into the root node_modules/.bun store, so both must be copied with the same layout.
COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package.json ./package.json

ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

CMD ["node", "dist/main.js"]

