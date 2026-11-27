import { Body, Controller, Get, Post } from "@nestjs/common";
import {
	type CreateUnitRequest,
	createUnitRequestSchema,
	type ListUnitsResponse,
	type Unit,
} from "@tenora/contracts";
import type { Actor } from "../../../authz/actor";
import { CurrentActor, RequirePermission } from "../../../authz/authz.decorators";
import { ZodValidationPipe } from "../../../common/zod-validation.pipe";
import { UnitsService } from "../../../domain/units/units.service";

@Controller("units")
export class UnitsController {
	constructor(private readonly units: UnitsService) {}

	@Get()
	@RequirePermission("units:view")
	list(@CurrentActor() actor: Actor): Promise<ListUnitsResponse> {
		return this.units.list(actor.organizationId);
	}

	@Post()
	@RequirePermission("units:create")
	create(
		@CurrentActor() actor: Actor,
		@Body(new ZodValidationPipe(createUnitRequestSchema)) input: CreateUnitRequest,
	): Promise<Unit> {
		return this.units.create(actor.organizationId, input);
	}
}
