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

# Copy built Next.js app and dependencies
COPY --from=builder /app/apps/web/.next ./.next
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder /app/apps/web/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "run", "start"]

