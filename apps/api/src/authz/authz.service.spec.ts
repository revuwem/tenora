import type { Permission } from "@tenora/contracts";
import { describe, expect, it } from "vitest";
import type { Actor } from "./actor";
import { AuthzService } from "./authz.service";

const actor: Actor = {
	user: { id: "u1", email: "a@example.test", name: "A" },
	organizationId: "org-a",
	role: "admin",
};

describe("AuthzService.can", () => {
	const authz = new AuthzService();

	it.each<Permission>(["units:view", "units:create"])("lets an admin %s", (permission) => {
		expect(authz.can(actor, permission)).toBe(true);
	});

	it("allows a resource in the actor's own Organization", () => {
		expect(authz.can(actor, "units:view", { organizationId: "org-a" })).toBe(true);
	});

	it("denies a resource in another Organization, whatever the role allows", () => {
		expect(authz.can(actor, "units:view", { organizationId: "org-b" })).toBe(false);
	});

	it("lists the actor's permissions", () => {
		expect(authz.permissionsOf(actor)).toEqual(["units:view", "units:create"]);
	});
});
