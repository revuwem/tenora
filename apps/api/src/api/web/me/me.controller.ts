import { Controller, Get } from "@nestjs/common";
import type { MeResponse } from "@tenora/contracts";
import type { Actor } from "../../../authz/actor";
import { AnyMember, CurrentActor } from "../../../authz/authz.decorators";
import { AuthzService } from "../../../authz/authz.service";

@Controller("me")
export class MeController {
	constructor(private readonly authz: AuthzService) {}

	/** The signed-in user and what they may do. The web app uses it to hide UI; the api stays the authority. */
	@Get()
	@AnyMember()
	getMe(@CurrentActor() actor: Actor): MeResponse {
		return {
			user: actor.user,
			organizationId: actor.organizationId,
			role: actor.role,
			permissions: [...this.authz.permissionsOf(actor)],
		};
	}
}
