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

**Git worktrees:** the main checkout uses ports 3000 (web) and 8000 (api). In a linked worktree, `scripts/docker.sh` gives the stack its own Compose project name and its own free ports (3001–3099 / 8001–8099), saved in the gitignored `.env.docker.local`. Run `bun run docker:ports` to see the URLs for the current worktree. Delete `.env.docker.local` to pick new ports. Remove a worktree's containers and volumes with `bun run docker:dev:down` before deleting the worktree.

**Calling the API from web:** use `apiUrl("/path")` from `apps/web/src/lib/api.ts`. The browser calls the api's published port (`NEXT_PUBLIC_API_URL`, `http://localhost:<API_PORT>`), server-side code uses the Docker network address (`API_INTERNAL_URL`). The api allows the web origin through `CORS_ORIGIN`. All three follow `WEB_PORT` / `API_PORT`, so they are correct per worktree. In the prod stack `NEXT_PUBLIC_API_URL` is baked in at image build, so rebuild if ports change.

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

Dev and prod stacks of the same checkout use the same ports, so run only one at a time.

## Checks

```bash
bun run check        # lint, type-check, format, test
bun run lint:fix     # apply lint fixes
bun run format:fix   # apply formatting
```
