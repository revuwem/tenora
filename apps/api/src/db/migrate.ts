import { join } from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { requireEnv } from "../common/env";
import { createDatabase } from "./db";

// Runs from src/ (bun) and from dist/ (node): both sit one level below the api root.
const migrationsFolder = join(__dirname, "../../drizzle");

async function main() {
	const { db, pool } = createDatabase(requireEnv("DATABASE_URL"));
	try {
		await migrate(db, { migrationsFolder });
		console.log("Migrations applied");
	} finally {
		await pool.end();
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
