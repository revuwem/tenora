import type { Permission, Role } from "@tenora/contracts";
import { describe, expect, it } from "vitest";
import { ROLE_PERMISSIONS } from "./roles";

describe("ROLE_PERMISSIONS", () => {
	const cases: [Role, Permission, boolean][] = [
		["admin", "units:view", true],
		["admin", "units:create", true],
	];

	it.each(cases)("%s %s: %s", (role, permission, allowed) => {
		expect(ROLE_PERMISSIONS[role].includes(permission)).toBe(allowed);
	});
});
