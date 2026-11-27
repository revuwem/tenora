# tenora
Rental ops for small real estate businesses

## Structure

- `apps/web` – Next.js frontend (http://localhost:3000)
- `apps/api` – NestJS API (http://localhost:8000), Postgres through Drizzle
- `packages/contracts` – zod request/response schemas shared by api and web (`@tenora/contracts`)
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

**Calling the API from web:** the browser calls `/api/*` on the web app's own origin and Next.js rewrites it to the api (`apps/web/src/lib/api-rewrites.ts`): `/api/auth/*` to Better Auth on the api, every other `/api/<route>` to `/<route>`. That means no CORS and a first-party session cookie. Server components call the api directly with `apiFetch("/path")` from `apps/web/src/lib/api.ts`, which forwards the user's cookie. Both use `API_INTERNAL_URL` (the api's Docker network address). Next.js bakes the rewrite destination into the build, so it is a build argument in the web Dockerfile; server components read it at run time. In the prod stack the api's port is not published; the dev stack publishes it for convenience. The rewrite passes `X-Forwarded-For` on untouched and adds nothing, so the api records the web app's address, not the browser's, unless `TRUST_PROXY_HOPS=1` is set for a reverse proxy you control in front of the web app (a client can otherwise write any address it likes).

**Database:** the dev stack runs Postgres (not published to the host, so worktrees can't collide on its port). A one-shot `setup` service waits for it, builds `@tenora/contracts`, runs `db:migrate` and `db:seed`, and only then are the api and web started. The api never migrates on startup. Changing `packages/contracts` needs a `docker:dev` restart, because the api reads its built output.

Dependencies live inside the containers. After changing dependencies, run `bun run docker:dev` again; it rebuilds the image and recreates the `node_modules` volumes.

### Without Docker

```bash
bun install
bun run dev
```

**Sign-in:** Better Auth serves `/api/auth/*` from the api (email and password, sessions in the database, HttpOnly cookie). In the dev stack the seed creates the Organization, its Admin `admin@example.com` and their membership with password `dev-admin-password` (override with `ADMIN_EMAIL` / `ADMIN_PASSWORD` in your shell). Outside Docker, copy `apps/api/.env.example` to `apps/api/.env`; Bun loads it for the `db:*` scripts and `bun run dev`. The prod stack needs `BETTER_AUTH_SECRET` (at least 32 random characters) in the environment. `bun run --filter api auth:generate` regenerates Better Auth's tables in `src/auth/auth.schema.ts` after its options change; then run `db:generate`.

**Access control:** every api route must declare what it needs, or it is rejected with 403: `@Public()` (anyone), `@AnyMember()` (any user with a membership) or `@RequirePermission("units:view")`. No session gives 401; a user without a membership or the permission gets 403. `GET /me` returns the signed-in user, their role and their permissions. The permission and role lists live in `packages/contracts`; the role-to-permission map is `ROLE_PERMISSIONS` in `apps/api/src/authz/roles.ts`.

### Database commands

Run from `apps/api` (or `bun run --filter api <script>`), with `DATABASE_URL` set: `db:generate` (SQL migration from the schema re-exported in `src/db/schema.ts`, written to `apps/api/drizzle`), `db:migrate`, `db:seed` (safe to run again). The built image applies migrations with `node dist/db/migrate.js`. In CI, `db:migrate` runs against a Postgres service container. Integration tests (`*.int.spec.ts`) need Docker running, or `TEST_DATABASE_URL` pointing at a Postgres server.

## Running the production build locally

```bash
bun run docker:prod            # foreground
bun run docker:prod:detached   # background
bun run docker:prod:down       # stop
```

The prod stack runs a one-shot `migrate` service before the api starts. It does not seed.

Dev and prod stacks of the same checkout use the same ports, so run only one at a time.

## Checks

`bun run check` runs the api integration tests, so Docker must be running (or set `TEST_DATABASE_URL` to a Postgres server). The Stop hook runs it too.

```bash
bun run check        # lint, type-check, format, test
bun run lint:fix     # apply lint fixes
bun run format:fix   # apply formatting
```
