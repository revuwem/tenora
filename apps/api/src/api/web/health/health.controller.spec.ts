import { healthResponseSchema } from "@tenora/contracts";
import { describe, expect, it } from "vitest";
import { HealthController } from "./health.controller";

describe("HealthController", () => {
	it("answers with a response that matches the contract", () => {
		const response = new HealthController().getHealth();
		expect(healthResponseSchema.parse(response)).toEqual({ status: "ok" });
	});
});
