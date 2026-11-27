import { Module } from "@nestjs/common";
import { AuthModule as BetterAuthModule } from "@thallesp/nestjs-better-auth";
import { requireEnv } from "../common/env";
import type { Database } from "../db/db";
import { DATABASE } from "../db/db.module";
import { createAuth } from "./auth.config";
import { CurrentUserService } from "./current-user.service";

/**
 * The single place that knows about Better Auth. It serves the sign-in routes under
 * /api/auth and exports only CurrentUserService. Needs `bodyParser: false` in the Nest app.
 *
 * The library's own global guard is off: deciding who may do what is the access control
 * module's job (ADR 0004), not this one's.
 */
@Module({
	imports: [
		BetterAuthModule.forRootAsync({
			// Read when the module is built, so it can't come from useFactory's result.
			disableGlobalAuthGuard: true,
			inject: [DATABASE],
			useFactory: (db: Database) => ({
				auth: createAuth(db, {
					secret: requireEnv("BETTER_AUTH_SECRET"),
					baseURL: requireEnv("BETTER_AUTH_URL"),
				}),
			}),
		}),
	],
	providers: [CurrentUserService],
	exports: [CurrentUserService],
})
export class AuthModule {}
