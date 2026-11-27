import { describe, expect, it } from "vitest";
import { createUnitRequestSchema, unitSchema } from "./units";

describe("createUnitRequestSchema", () => {
	it("accepts a name and an address", () => {
		expect(createUnitRequestSchema.parse({ name: "Flat 4", address: "12 Rustaveli Ave" })).toEqual({
			name: "Flat 4",
			address: "12 Rustaveli Ave",
		});
	});

	it("accepts an optional building label", () => {
		const unit = { name: "Flat 4", address: "12 Rustaveli Ave", buildingLabel: "Block B" };
		expect(createUnitRequestSchema.parse(unit)).toEqual(unit);
	});

	it.each(["name", "address"])("requires %s", (field) => {
		const unit = { name: "Flat 4", address: "12 Rustaveli Ave", [field]: "   " };
		expect(createUnitRequestSchema.safeParse(unit).success).toBe(false);
		expect(createUnitRequestSchema.safeParse({ ...unit, [field]: undefined }).success).toBe(false);
	});

	it("trims text and treats a blank building label as none", () => {
		expect(
			createUnitRequestSchema.parse({
				name: " Flat 4 ",
				address: " 12 Rustaveli ",
				buildingLabel: "  ",
			}),
		).toEqual({ name: "Flat 4", address: "12 Rustaveli" });
	});

	it("drops fields it does not know, such as an organizationId", () => {
		const parsed = createUnitRequestSchema.parse({
			name: "Flat 4",
			address: "12 Rustaveli Ave",
			organizationId: "someone-elses",
		});
		expect(parsed).not.toHaveProperty("organizationId");
	});
});

describe("unitSchema", () => {
	it("describes a stored Unit, with no building label as null", () => {
		const unit = { id: "u1", name: "Flat 4", address: "12 Rustaveli Ave", buildingLabel: null };
		expect(unitSchema.parse(unit)).toEqual(unit);
	});
});
