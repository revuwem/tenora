import { defineConfig } from "drizzle-kit";

// Only used to generate migrations (`bun run db:generate`); applying them is db:migrate.
export default defineConfig({
	dialect: "postgresql",
	schema: "./src/db/schema.ts",
	out: "./drizzle",
});
