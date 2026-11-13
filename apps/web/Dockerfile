# Keep in sync with "packageManager" in the root package.json (and the api Dockerfile).
ARG BUN_VERSION=1.3.10

FROM oven/bun:${BUN_VERSION} AS bun


# ---- dev: install deps only; source is bind-mounted by docker-compose.dev.yml ----
# Build with `--target dev`. The default (last) stage below is the production runtime.
# Real Node (same major as the prod runtime) plus the bun binary for installs/scripts.
FROM node:25-slim AS dev

COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun

WORKDIR /app

# Install from the manifests only, so editing source never re-runs the install.
# Keep these lines identical to the api dev stage so both images share the layer.
# Add a line here when a new workspace package is created.
COPY package.json bun.lock ./
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
FROM bun AS pruner

WORKDIR /app

COPY . .
# Nothing is installed yet, so run the turbo version declared in the root package.json
# (pinned exactly there, so it matches the lockfile).
# turbo warns that it is not "locally installed": expected at this stage.
RUN version="$(bun -p 'require("./package.json").devDependencies.turbo' | sed -E 's/^[\^~]//')" \
  && test -n "$version" \
  && echo "turbo version from package.json: $version" \
  && bunx turbo@${version} prune web --docker


# ---- prod: build ----
FROM bun AS builder

WORKDIR /app

COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock

RUN --mount=type=cache,target=/root/.bun/install/cache \
  bun install --frozen-lockfile

COPY --from=pruner /app/out/full/ .

# NEXT_PUBLIC_* values are inlined into the client bundle at build time.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build only the web app (Next.js, standalone output). The cache mount keeps Next's
# build cache between local builds; it is not part of the image.
RUN --mount=type=cache,target=/app/apps/web/.next/cache \
  bunx turbo run build --filter=web...


FROM node:25-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
# The standalone server listens on $HOSTNAME; bind all interfaces so the published
# port is reachable from outside the container.
ENV HOSTNAME=0.0.0.0

# `next build` (output: "standalone", traced from the repo root) emits a minimal server
# with only the dependencies it needs, at .next/standalone/apps/web/server.js.
# Static assets and public/ are not included in it and are copied alongside.
# .next must be writable for the unprivileged `node` user (runtime image/ISR cache).
RUN mkdir -p apps/web/.next && chown node:node apps/web/.next
COPY --from=builder --chown=node:node /app/apps/web/.next/standalone ./
COPY --from=builder --chown=node:node /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=node:node /app/apps/web/public ./apps/web/public

USER node

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
