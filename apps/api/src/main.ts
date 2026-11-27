import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { configureApp, parseTrustedProxyHops } from "./app.setup";

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
	configureApp(app, { trustedProxyHops: parseTrustedProxyHops(process.env.TRUST_PROXY_HOPS) });
	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
