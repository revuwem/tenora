import type { Permission } from "@tenora/contracts";
import { Injectable } from "@nestjs/common";
import type { Actor } from "./actor";
import { ROLE_PERMISSIONS } from "./roles";

/** Something that belongs to an Organization, such as a Unit. */
export interface Resource {
	organizationId: string;
}

/**
 * The one place that answers "may this user do this?" (ADR 0004). Callers pass a permission,
 * never a role name, so a policy library or per-Organization roles can replace the inside
 * later without touching them.
 */
@Injectable()
export class AuthzService {
	can(actor: Actor, permission: Permission, resource?: Resource): boolean {
		// Organization boundary: independent of what the role allows.
		if (resource && resource.organizationId !== actor.organizationId) return false;
		return ROLE_PERMISSIONS[actor.role].includes(permission);
	}

	permissionsOf(actor: Actor): readonly Permission[] {
		return ROLE_PERMISSIONS[actor.role];
	}
}
