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


# ---- prod: prune ----
# `turbo prune --docker` writes out/json (package.json files + pruned lockfile) and
# out/full (source), limited to the web app and the workspace packages it depends on.
# The builder installs from out/json only, so the install layer is reused until the
# web app's dependencies change, and it never installs the api's dependencies.
FROM oven/bun:1 AS pruner

WORKDIR /app

COPY . .
# Nothing is installed yet, so run the turbo version declared in the root package.json
# (leading ^ or ~ stripped; pin the exact version there so this matches the lockfile).
# turbo warns that it is not "locally installed": expected at this stage.
RUN version="$(bun -p 'require("./package.json").devDependencies.turbo' | sed -E 's/^[\^~]//')" \
  && test -n "$version" \
  && echo "turbo version from package.json: $version" \
  && bunx turbo@${version} prune web --docker


# ---- prod: build ----
FROM oven/bun:1 AS builder

WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock

RUN --mount=type=cache,target=/root/.bun/install/cache \
  bun install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

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

