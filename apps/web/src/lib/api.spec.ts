import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieHeader = vi.hoisted(() => vi.fn(() => "better-auth.session_token=abc"));
vi.mock("next/headers", () => ({ cookies: async () => ({ toString: cookieHeader }) }));

import { apiFetch, apiUrl } from "./api";

describe("apiUrl", () => {
	beforeEach(() => {
		vi.stubEnv("API_INTERNAL_URL", "http://api:8000");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("joins the internal address and the path", () => {
		expect(apiUrl("/me")).toBe("http://api:8000/me");
		expect(apiUrl("units")).toBe("http://api:8000/units");
	});
});

describe("apiFetch", () => {
	const fetchMock = vi.fn(async () => new Response("{}"));

	beforeEach(() => {
		vi.stubEnv("API_INTERNAL_URL", "http://api:8000");
		vi.stubGlobal("fetch", fetchMock);
		fetchMock.mockClear();
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	it("calls the api with the user's cookie and without caching", async () => {
		await apiFetch("/units", { method: "GET" });

		expect(fetchMock).toHaveBeenCalledWith("http://api:8000/units", {
			method: "GET",
			headers: { cookie: "better-auth.session_token=abc" },
			cache: "no-store",
		});
	});
});
