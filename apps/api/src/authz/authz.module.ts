import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "../auth/auth.module";
import { AuthzGuard } from "./authz.guard";
import { AuthzService } from "./authz.service";
import { MembershipsRepository } from "./memberships.repository";

@Module({
	imports: [AuthModule],
	providers: [AuthzService, MembershipsRepository, { provide: APP_GUARD, useClass: AuthzGuard }],
	exports: [AuthzService],
})
export class AuthzModule {}
