import { Global, Inject, Module, OnModuleDestroy } from "@nestjs/common";
import { requireEnv } from "../common/env";
import { createDatabase, type DatabaseHandle } from "./db";

export const DATABASE = Symbol("DATABASE");
const DATABASE_HANDLE = Symbol("DATABASE_HANDLE");

/** Provides the Drizzle client. Repositories are the only code that should inject it. */
@Global()
@Module({
	providers: [
		{
			provide: DATABASE_HANDLE,
			useFactory: () => createDatabase(requireEnv("DATABASE_URL")),
		},
		{
			provide: DATABASE,
			inject: [DATABASE_HANDLE],
			useFactory: (handle: DatabaseHandle) => handle.db,
		},
	],
	exports: [DATABASE],
})
export class DbModule implements OnModuleDestroy {
	constructor(@Inject(DATABASE_HANDLE) private readonly handle: DatabaseHandle) {}

	async onModuleDestroy() {
		await this.handle.pool.end();
	}
}
