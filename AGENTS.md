## Agent skills

### Issue tracker

Issues are tracked in GitHub Issues (revuwem/tenora) via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-label vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Testing

- `bun run check` runs lint, type-check, format and tests across the repo. Run it before finishing; a Stop hook (`.claude/hooks/stop-check.sh`) runs it too when the tree has changes.
- `bun run test` runs all tests. One package: `bun run --filter <pkg> test` (`api`, `web`, `@tenora/ui`). One file: `bun run --filter <pkg> test -- <path>`. Watch mode: `test:watch` in the package.
- Never `bun test`: that is Bun's own runner, not Vitest.
- Specs sit next to the source as `*.spec.ts(x)`. In `web` and `@tenora/ui`, `*.spec.tsx` are component tests in a real Chromium (Vitest browser mode, `vitest-browser-react`) and `*.spec.ts` are logic tests in Node. In `api`, specs run in Node.
- Browser tests need Chromium once per machine: `bunx playwright install chromium` (run in `packages/ui`).
- `api` e2e tests are on demand only: `bun run --filter api test:e2e`. They are not in `test`, Turbo or CI.
