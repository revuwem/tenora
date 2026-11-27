import { describe, expect, it } from "vitest";
import { meResponseSchema, permissionSchema, roleSchema } from "./access";

describe("permissionSchema", () => {
	it.each(["units:view", "units:create"])("accepts %s", (permission) => {
		expect(permissionSchema.parse(permission)).toBe(permission);
	});

	it("rejects a permission that does not exist", () => {
		expect(permissionSchema.safeParse("units:delete").success).toBe(false);
	});
});

describe("roleSchema", () => {
	it("accepts admin and nothing else yet", () => {
		expect(roleSchema.safeParse("admin").success).toBe(true);
		expect(roleSchema.safeParse("manager").success).toBe(false);
	});
});

describe("meResponseSchema", () => {
	const me = {
		user: { id: "u1", email: "admin@example.com", name: "Admin" },
		organizationId: "o1",
		role: "admin",
		permissions: ["units:view", "units:create"],
	};

	it("accepts the signed-in user with their permissions", () => {
		expect(meResponseSchema.parse(me)).toEqual(me);
	});

	it("rejects an unknown permission", () => {
		expect(meResponseSchema.safeParse({ ...me, permissions: ["units:fly"] }).success).toBe(false);
	});
});
