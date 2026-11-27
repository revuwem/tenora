import {
	CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Permission } from "@tenora/contracts";
import { CurrentUserService } from "../auth/current-user.service";
import { ANY_MEMBER_KEY, PERMISSION_KEY, PUBLIC_KEY } from "./authz.decorators";
import { AuthzService } from "./authz.service";
import { MembershipsRepository } from "./memberships.repository";

/**
 * Global, deny by default (ADR 0004). A route must say what it needs: `@Public()`,
 * `@AnyMember()` or `@RequirePermission(...)`. The membership is read from the database on
 * every request, so removing someone takes effect at once.
 */
@Injectable()
export class AuthzGuard implements CanActivate {
	constructor(
		private readonly reflector: Reflector,
		private readonly currentUser: CurrentUserService,
		private readonly memberships: MembershipsRepository,
		private readonly authz: AuthzService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const targets = [context.getHandler(), context.getClass()];
		if (this.reflector.getAllAndOverride<boolean | undefined>(PUBLIC_KEY, targets)) return true;

		const permission = this.reflector.getAllAndOverride<Permission | undefined>(
			PERMISSION_KEY,
			targets,
		);
		const anyMember = this.reflector.getAllAndOverride<boolean | undefined>(
			ANY_MEMBER_KEY,
			targets,
		);
		if (!permission && !anyMember) {
			throw new ForbiddenException("This route declares no access rule");
		}

		const request = context.switchToHttp().getRequest();
		const user = await this.currentUser.fromRequest(request);
		if (!user) throw new UnauthorizedException();

		const actor = await this.memberships.findActorByUserId(user.id);
		if (!actor) throw new ForbiddenException();
		if (permission && !this.authz.can(actor, permission)) throw new ForbiddenException();

		request.actor = actor;
		return true;
	}
}
