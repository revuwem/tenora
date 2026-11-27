import { afterEach, describe, expect, it, vi } from "vitest";
import { requireEnv } from "./env";

describe("requireEnv", () => {
	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("returns the value when it is set", () => {
		vi.stubEnv("SOME_VALUE", "abc");
		expect(requireEnv("SOME_VALUE")).toBe("abc");
	});

	it("throws naming the variable when it is missing", () => {
		vi.stubEnv("SOME_VALUE", "");
		expect(() => requireEnv("SOME_VALUE")).toThrow("SOME_VALUE is not set");
	});
});
