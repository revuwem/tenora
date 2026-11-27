import { Module } from "@nestjs/common";
import { HealthController } from "./api/web/health/health.controller";
import { MeController } from "./api/web/me/me.controller";
import { AuthModule } from "./auth/auth.module";
import { AuthzModule } from "./authz/authz.module";
import { DbModule } from "./db/db.module";

@Module({
	imports: [DbModule, AuthModule, AuthzModule],
	controllers: [HealthController, MeController],
})
export class AppModule {}
