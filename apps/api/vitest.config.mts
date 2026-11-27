import { defineConfig } from "vitest/config";

// No SWC plugin needed: Vite's own transform honours `emitDecoratorMetadata` from
// tsconfig, which Nest's DI relies on.
export default defineConfig({
	test: {
		environment: "node",
		include: ["src/**/*.spec.ts"],
	},
});
