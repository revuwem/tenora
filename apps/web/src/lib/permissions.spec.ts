import { describe, expect, it } from "vitest";
import { can } from "./permissions";

const me = {
	user: { id: "u1", email: "a@example.test", name: "A" },
	permissions: ["units:view"],
} as const;

describe("can", () => {
	it("is true for a permission the user holds", () => {
		expect(can({ ...me, permissions: [...me.permissions] }, "units:view")).toBe(true);
	});

	it("is false for one they don't", () => {
		expect(can({ ...me, permissions: [...me.permissions] }, "units:create")).toBe(false);
	});
});
