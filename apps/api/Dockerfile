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

WORKDIR /app

# Copy built API dist and the node_modules required to run it
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

CMD ["node", "dist/main.js"]

