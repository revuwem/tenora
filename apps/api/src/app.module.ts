import { Module } from "@nestjs/common";
import { HealthController } from "./api/web/health/health.controller";
import { MeController } from "./api/web/me/me.controller";
import { UnitsController } from "./api/web/units/units.controller";
import { AuthModule } from "./auth/auth.module";
import { AuthzModule } from "./authz/authz.module";
import { DbModule } from "./db/db.module";
import { UnitsModule } from "./domain/units/units.module";

@Module({
	imports: [DbModule, AuthModule, AuthzModule, UnitsModule],
	controllers: [HealthController, MeController, UnitsController],
})
export class AppModule {}
