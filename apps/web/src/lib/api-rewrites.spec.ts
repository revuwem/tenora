import { afterEach, describe, expect, it, vi } from "vitest";
import { apiInternalUrl, apiRewrites } from "./api-rewrites";

describe("apiInternalUrl", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("reads API_INTERNAL_URL and drops a trailing slash", () => {
		vi.stubEnv("API_INTERNAL_URL", "http://api:8000/");
		expect(apiInternalUrl()).toBe("http://api:8000");
	});

	it("falls back to the api on localhost for running outside Docker", () => {
		vi.stubEnv("API_INTERNAL_URL", "");
		expect(apiInternalUrl()).toBe("http://localhost:8000");
	});
});

describe("apiRewrites", () => {
	const rewrites = apiRewrites("http://api:8000");

	it("checks the auth rewrite first, so /api/auth is not swallowed by the general one", () => {
		expect(rewrites.map((rewrite) => rewrite.source)).toEqual(["/api/auth/:path*", "/api/:path*"]);
	});

	it("sends Better Auth's routes to the same path on the api", () => {
		expect(rewrites[0]).toEqual({
			source: "/api/auth/:path*",
			destination: "http://api:8000/api/auth/:path*",
		});
	});

	it("sends every other /api route to the api without the prefix", () => {
		expect(rewrites[1]).toEqual({ source: "/api/:path*", destination: "http://api:8000/:path*" });
	});
});
