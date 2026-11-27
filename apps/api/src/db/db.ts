import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { requireEnv } from "../common/env";
import * as schema from "./schema";

export type DatabaseHandle = ReturnType<typeof createDatabase>;
export type Database = DatabaseHandle["db"];

export function createDatabase(connectionString: string) {
	const pool = new Pool({ connectionString });
	const db = drizzle(pool, { schema });
	return { db, pool };
}

/** Entry point for scripts (migrate, seed): connects, runs, always closes, exits 1 on failure. */
export function runWithDatabase(script: (db: Database) => Promise<void>): void {
	const { db, pool } = createDatabase(requireEnv("DATABASE_URL"));
	script(db)
		.finally(() => pool.end())
		.catch((error) => {
			console.error(error);
			process.exit(1);
		});
}
