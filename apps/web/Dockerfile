# ---- dev: install deps only; source is bind-mounted by docker-compose.dev.yml ----
# Build with `--target dev`. The default (last) stage below is the production runtime.
# Real Node (same major as the prod runtime) plus the bun binary for installs/scripts.
FROM node:20-slim AS dev

COPY --from=oven/bun:1 /usr/local/bin/bun /usr/local/bin/bun

WORKDIR /app

# Install from the manifests only, so editing source never re-runs the install.
# Keep these lines identical to the api dev stage so both images share the layer.
# Add a line here when a new workspace package is created.
COPY package.json bun.lock turbo.json ./
COPY apps/api/package.json apps/api/package.json
COPY apps/web/package.json apps/web/package.json
COPY packages/tsconfig/package.json packages/tsconfig/package.json
COPY packages/ui/package.json packages/ui/package.json

# The cache mount keeps bun's download cache between builds.
RUN --mount=type=cache,target=/root/.bun/install/cache \
  bun install --frozen-lockfile

COPY apps ./apps
COPY packages ./packages

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

# NEXT_PUBLIC_* values are inlined into the client bundle at build time.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

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

