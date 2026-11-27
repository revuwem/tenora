import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

// *.spec.tsx: component tests in a real Chromium. *.spec.ts: plain logic tests in Node.
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
	},
	test: {
		projects: [
			{
				extends: true,
				test: {
					name: "components",
					include: ["src/**/*.spec.tsx"],
					browser: {
						enabled: true,
						headless: true,
						provider: playwright(),
						instances: [{ browser: "chromium" }],
					},
				},
			},
			{
				extends: true,
				test: {
					name: "logic",
					environment: "node",
					include: ["src/**/*.spec.ts"],
				},
			},
		],
	},
});
