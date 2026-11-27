import { Global, Inject, Module, OnModuleDestroy } from "@nestjs/common";
import type { Pool } from "pg";
import { requireEnv } from "../common/env";
import { createDatabase } from "./db";

export const DATABASE = Symbol("DATABASE");
const POOL = Symbol("POOL");

/** Provides the Drizzle client. Repositories are the only code that should inject it. */
@Global()
@Module({
	providers: [
		{
			provide: POOL,
			useFactory: () => createDatabase(requireEnv("DATABASE_URL")),
		},
		{
			provide: DATABASE,
			inject: [POOL],
			useFactory: (database: ReturnType<typeof createDatabase>) => database.db,
		},
	],
	exports: [DATABASE],
})
export class DbModule implements OnModuleDestroy {
	constructor(@Inject(POOL) private readonly database: { pool: Pool }) {}

	async onModuleDestroy() {
		await this.database.pool.end();
	}
}
