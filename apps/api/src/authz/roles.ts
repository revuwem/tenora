import { PERMISSIONS, type Permission, type Role } from "@tenora/contracts";

/**
 * What each role may do. Admin and Manager are fixed presets in code (ADR 0004). Only the Admin
 * exists so far: full access.
 */
export const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
	admin: PERMISSIONS,
};
