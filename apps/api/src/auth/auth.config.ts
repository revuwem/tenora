import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import type { Database } from "../db/db";
import * as schema from "../db/schema";
import { CLIENT_IP_HEADER } from "../common/client-ip";
import { password } from "./password";

export interface AuthSettings {
	/** Signs and encrypts cookies and tokens. At least 32 characters, kept secret. */
	secret: string;
	/** The web app's origin: the browser reaches the api through it (ADR 0003). */
	baseURL: string;
}

export function createAuth(db: Database, settings: AuthSettings) {
	return betterAuth({
		...settings,
		database: drizzleAdapter(db, { provider: "pg", schema }),
		emailAndPassword: { enabled: true, password },
		// Sessions are database records carried in an HttpOnly cookie: no cookie cache and
		// no JWT, so removing a user takes effect immediately (ADR 0002).
		session: { cookieCache: { enabled: false } },
		advanced: {
			database: { generateId: "uuid" },
			// Only the header we set ourselves (overwriteClientIp), never one a client controls.
			ipAddress: { ipAddressHeaders: [CLIENT_IP_HEADER] },
		},
		// Needed by @thallesp/nestjs-better-auth for its hook decorators.
		hooks: {},
	});
}

export type Auth = ReturnType<typeof createAuth>;
