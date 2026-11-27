import { Injectable } from "@nestjs/common";
import type { CreateUnitRequest, Unit } from "@tenora/contracts";
import { UnitsRepository } from "./units.repository";

@Injectable()
export class UnitsService {
	constructor(private readonly repository: UnitsRepository) {}

	list(organizationId: string): Promise<Unit[]> {
		return this.repository.list(organizationId);
	}

	create(organizationId: string, input: CreateUnitRequest): Promise<Unit> {
		return this.repository.create(organizationId, input);
	}
}
