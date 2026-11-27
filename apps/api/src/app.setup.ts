import type { NestExpressApplication } from "@nestjs/platform-express";
import { overwriteClientIp } from "./common/client-ip";

export interface AppSettings {
	/**
	 * How many proxies in front of the api to believe about the client's address (Express
	 * "trust proxy"). 0, the default, trusts no forwarded header at all: the recorded address is
	 * the web app's, which no client can fake. Set 1 only when a reverse proxy you control sits
	 * in front of the web app and sets X-Forwarded-For, because the web app's rewrite passes
	 * that header on untouched and adds nothing of its own.
	 */
	trustedProxyHops?: number;
}

/** Reads TRUST_PROXY_HOPS: a whole number, 0 when unset. A typo fails at startup, not silently. */
export function parseTrustedProxyHops(value: string | undefined): number {
	if (value === undefined || value === "") return 0;
	const hops = Number(value);
	if (!Number.isInteger(hops) || hops < 0) {
		throw new Error(`TRUST_PROXY_HOPS must be a whole number of 0 or more, got "${value}"`);
	}
	return hops;
}

/**
 * Settings shared by the real app (main.ts) and the tests, so tests run the app as it is run.
 * Create the app with `bodyParser: false`: Better Auth reads the raw body of its own routes and
 * its Nest module re-adds the default parsers for everything else.
 */
export function configureApp(app: NestExpressApplication, settings: AppSettings = {}) {
	app.set("trust proxy", settings.trustedProxyHops ?? 0);
	app.use(overwriteClientIp);
}
