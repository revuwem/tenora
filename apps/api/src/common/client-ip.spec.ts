import type { NextFunction, Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { CLIENT_IP_HEADER, overwriteClientIp } from "./client-ip";

describe("overwriteClientIp", () => {
	const run = (request: Partial<Request>) => {
		const next = vi.fn();
		overwriteClientIp(request as Request, {} as Response, next as NextFunction);
		return { request, next };
	};

	it("sets the header to the address Express resolved", () => {
		const { request, next } = run({ ip: "203.0.113.7", headers: {} });
		expect(request.headers?.[CLIENT_IP_HEADER]).toBe("203.0.113.7");
		expect(next).toHaveBeenCalledOnce();
	});

	it("replaces a value the client sent", () => {
		const { request } = run({ ip: "203.0.113.7", headers: { [CLIENT_IP_HEADER]: "6.6.6.6" } });
		expect(request.headers?.[CLIENT_IP_HEADER]).toBe("203.0.113.7");
	});

	it("removes the header when no address is known, rather than keeping the client's", () => {
		const { request } = run({ ip: undefined, headers: { [CLIENT_IP_HEADER]: "6.6.6.6" } });
		expect(request.headers).not.toHaveProperty(CLIENT_IP_HEADER);
	});
});
