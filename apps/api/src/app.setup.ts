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

/**
 * Settings shared by the real app (main.ts) and the tests, so tests run the app as it is run.
 * Create the app with `bodyParser: false`: Better Auth reads the raw body of its own routes and
 * its Nest module re-adds the default parsers for everything else.
 */
export function configureApp(app: NestExpressApplication, settings: AppSettings = {}) {
	app.set("trust proxy", settings.trustedProxyHops ?? 0);
	app.use(overwriteClientIp);
}
