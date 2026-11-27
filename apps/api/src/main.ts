import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import { configureApp } from "./app.setup";

async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
	configureApp(app, { trustedProxyHops: Number(process.env.TRUST_PROXY_HOPS ?? 0) });
	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
