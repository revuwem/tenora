# tenora
Rental ops for small real estate businesses

## Structure

- `apps/web` – Next.js frontend (http://localhost:3000)
- `apps/api` – NestJS API (http://localhost:8000)
- `packages/ui` – shared shadcn/ui components and theme (`@tenora/ui`)
- `packages/tsconfig` – shared TypeScript configs

## Running the dev server

Dev servers reload automatically when you edit code (including `packages/ui`).

### With Docker (recommended)

```bash
bun run docker:dev
```

Starts web and api with hot reload. Stop with `Ctrl+C`, or from another terminal:

```bash
bun run docker:dev:down
```

Dependencies live inside the containers. After changing dependencies, run `bun run docker:dev` again; it rebuilds the image and recreates the `node_modules` volumes.

### Without Docker

```bash
bun install
bun run dev
```

## Running the production build locally

```bash
bun run docker:prod            # foreground
bun run docker:prod:detached   # background
bun run docker:prod:down       # stop
```

Dev and prod stacks both use ports 3000 and 8000, so run only one at a time.

## Checks

```bash
bun run check        # lint, type-check, format, test
bun run lint:fix     # apply lint fixes
bun run format:fix   # apply formatting
```
