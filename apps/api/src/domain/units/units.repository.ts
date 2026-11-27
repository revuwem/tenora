import { Inject, Injectable } from "@nestjs/common";
import type { CreateUnitRequest, Unit } from "@tenora/contracts";
import { asc, eq } from "drizzle-orm";
import type { Database } from "../../db/db";
import { DATABASE } from "../../db/db.module";
import { units } from "./unit.schema";

const columns = {
	id: units.id,
	name: units.name,
	address: units.address,
	buildingLabel: units.buildingLabel,
};

/**
 * The only code that touches the units table. Every method takes the Organization, which the
 * caller gets from the signed-in user and never from request input.
 */
@Injectable()
export class UnitsRepository {
	constructor(@Inject(DATABASE) private readonly db: Database) {}

	list(organizationId: string): Promise<Unit[]> {
		return this.db
			.select(columns)
			.from(units)
			.where(eq(units.organizationId, organizationId))
			.orderBy(asc(units.createdAt), asc(units.id));
	}

	async create(organizationId: string, input: CreateUnitRequest): Promise<Unit> {
		// organizationId last, so nothing in `input` can ever override it.
		const [unit] = await this.db
			.insert(units)
			.values({ ...input, organizationId })
			.returning(columns);
		return unit;
	}
}
