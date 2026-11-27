import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiUrl } from "./api";

describe("apiUrl", () => {
	beforeEach(() => {
		vi.unstubAllEnvs();
		vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8000");
		vi.stubEnv("API_INTERNAL_URL", "");
	});

	afterEach(() => {
		vi.unstubAllEnvs();
		vi.unstubAllGlobals();
	});

	it("joins the base URL and path in the browser", () => {
		expect(apiUrl("/health")).toBe("http://localhost:8000/health");
	});

	it("normalises trailing and leading slashes", () => {
		vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8000/");
		expect(apiUrl("health")).toBe("http://localhost:8000/health");
	});

	it("prefers API_INTERNAL_URL on the server", () => {
		vi.stubEnv("API_INTERNAL_URL", "http://api:8000");
		vi.stubGlobal("window", undefined);
		expect(apiUrl("/health")).toBe("http://api:8000/health");
	});

	it("ignores API_INTERNAL_URL in the browser", () => {
		vi.stubEnv("API_INTERNAL_URL", "http://api:8000");
		expect(apiUrl("/health")).toBe("http://localhost:8000/health");
	});

	it("throws when no base URL is configured", () => {
		vi.stubEnv("NEXT_PUBLIC_API_URL", "");
		expect(() => apiUrl("/health")).toThrow("NEXT_PUBLIC_API_URL is not set");
	});
});
