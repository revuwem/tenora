import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		// Better Auth reads the raw body of its own routes; its Nest module re-adds the
		// default parsers for everything else.
		bodyParser: false,
	});
	// Comma-separated list of allowed web origins. Docker sets it per worktree.
	app.enableCors({
		origin: (process.env.CORS_ORIGIN ?? "http://localhost:3000").split(","),
	});
	await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
