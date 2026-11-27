import { defineConfig } from "vitest/config";

// On demand only (`bun run test:e2e`): not part of `test`, Turbo or CI.
export default defineConfig({
	test: {
		environment: "node",
		include: ["test/**/*.e2e-spec.ts"],
	},
});
