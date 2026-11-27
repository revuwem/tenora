import { describe, expect, it } from "vitest";
import { parseTrustedProxyHops } from "./app.setup";

describe("parseTrustedProxyHops", () => {
	it.each([undefined, ""])("trusts no proxy when it is %j", (value) => {
		expect(parseTrustedProxyHops(value)).toBe(0);
	});

	it("reads a number of hops", () => {
		expect(parseTrustedProxyHops("1")).toBe(1);
	});

	it.each(["one", "-1", "1.5", "NaN"])("rejects %j", (value) => {
		expect(() => parseTrustedProxyHops(value)).toThrow("TRUST_PROXY_HOPS");
	});
});
