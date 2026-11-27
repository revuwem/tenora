import { join } from "node:path";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { runWithDatabase } from "./db";

// Runs from src/ (bun) and from dist/ (node): both sit one level below the api root.
const migrationsFolder = join(__dirname, "../../drizzle");

runWithDatabase(async (db) => {
	await migrate(db, { migrationsFolder });
	console.log("Migrations applied");
});
