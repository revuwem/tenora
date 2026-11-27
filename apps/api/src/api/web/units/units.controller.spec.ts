import type { Permission } from "@tenora/contracts";
import { describe, expect, it } from "vitest";
import { PERMISSION_KEY } from "../../../authz/authz.decorators";
import { UnitsController } from "./units.controller";

// Only the Admin role exists, so a wrong permission can't show up over HTTP yet: pin what each
// route declares instead.
describe("UnitsController permissions", () => {
	const declared = (handler: keyof UnitsController) =>
		Reflect.getMetadata(PERMISSION_KEY, UnitsController.prototype[handler]);

	it.each<[keyof UnitsController, Permission]>([
		["list", "units:view"],
		["create", "units:create"],
	])("%s requires %s", (handler, permission) => {
		expect(declared(handler)).toBe(permission);
	});
});
