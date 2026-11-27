import { beforeEach, describe, expect, it, vi } from "vitest";

const apiFetch = vi.hoisted(() => vi.fn());
vi.mock("./api", () => ({ apiFetch }));

import { listUnits } from "./units";

describe("listUnits", () => {
	beforeEach(() => {
		apiFetch.mockReset();
	});

	it("returns the Units the api sent", async () => {
		const units = [{ id: "1", name: "Flat 4", address: "12 Rustaveli Ave", buildingLabel: null }];
		apiFetch.mockResolvedValue(Response.json(units));
		await expect(listUnits()).resolves.toEqual(units);
		expect(apiFetch).toHaveBeenCalledWith("/units");
	});

	it("fails when the api refuses", async () => {
		apiFetch.mockResolvedValue(new Response(null, { status: 403 }));
		await expect(listUnits()).rejects.toThrow("GET /units failed with 403");
	});

	it("fails when the response is not a list of Units", async () => {
		apiFetch.mockResolvedValue(Response.json([{ id: 1 }]));
		await expect(listUnits()).rejects.toThrow();
	});
});
