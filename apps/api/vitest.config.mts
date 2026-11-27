import { defineConfig } from "vitest/config";

// No SWC plugin needed: Vite's own transform honours `emitDecoratorMetadata` from
// tsconfig, which Nest's DI relies on.
//
// *.spec.ts: unit tests, no I/O. *.int.spec.ts: integration tests against a real Postgres
// (see test/support/global-setup.ts for where it comes from).
export default defineConfig({
	test: {
		environment: "node",
		projects: [
			{
				extends: true,
				test: {
					name: "unit",
					include: ["src/**/*.spec.ts"],
					exclude: ["src/**/*.int.spec.ts"],
				},
			},
			{
				extends: true,
				test: {
					name: "integration",
					include: ["src/**/*.int.spec.ts"],
					globalSetup: ["test/support/global-setup.ts"],
					env: {
						BETTER_AUTH_SECRET: "test-secret-with-at-least-thirty-two-characters",
						BETTER_AUTH_URL: "http://localhost:3000",
					},
				},
			},
		],
	},
});
