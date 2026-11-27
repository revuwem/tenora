import { beforeEach, describe, expect, it, vi } from "vitest";

const apiFetch = vi.hoisted(() => vi.fn());
vi.mock("./api", () => ({ apiFetch }));

import { getMe } from "./me";

const me = {
	user: { id: "u1", email: "admin@example.com", name: "Admin" },
	permissions: ["units:view", "units:create"],
};

describe("getMe", () => {
	beforeEach(() => {
		apiFetch.mockReset();
	});

	it("returns the user and their permissions", async () => {
		apiFetch.mockResolvedValue(Response.json(me));
		await expect(getMe()).resolves.toEqual({ status: "ok", me });
	});

	it("reports a missing session as signed out", async () => {
		apiFetch.mockResolvedValue(new Response(null, { status: 401 }));
		await expect(getMe()).resolves.toEqual({ status: "signed-out" });
	});

	it("reports a user without a membership as having no access", async () => {
		apiFetch.mockResolvedValue(new Response(null, { status: 403 }));
		await expect(getMe()).resolves.toEqual({ status: "no-access" });
	});

	it("fails loudly on anything else", async () => {
		apiFetch.mockResolvedValue(new Response(null, { status: 500 }));
		await expect(getMe()).rejects.toThrow("GET /me failed with 500");
	});
});
