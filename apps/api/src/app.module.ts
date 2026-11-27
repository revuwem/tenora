import { Module } from "@nestjs/common";
import { HealthController } from "./api/web/health/health.controller";
import { AuthModule } from "./auth/auth.module";
import { DbModule } from "./db/db.module";

@Module({
	imports: [DbModule, AuthModule],
	controllers: [HealthController],
})
export class AppModule {}
