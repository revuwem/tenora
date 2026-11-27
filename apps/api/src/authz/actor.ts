import type { Role } from "@tenora/contracts";
import type { CurrentUser } from "../auth/current-user";

/** A signed-in user acting inside their Organization, with the role they hold there. */
export interface Actor {
	user: CurrentUser;
	organizationId: string;
	role: Role;
}
