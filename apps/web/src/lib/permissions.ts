import type { MeResponse, Permission } from "@tenora/contracts";

/** Whether the signed-in user holds a permission. Only to hide UI: the api decides. */
export function can(me: MeResponse, permission: Permission): boolean {
	return me.permissions.includes(permission);
}
