import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { organizations } from "../organizations/organization.schema";

export const units = pgTable(
	"units",
	{
		id: uuid("id").primaryKey().defaultRandom(),
		organizationId: uuid("organization_id")
			.notNull()
			.references(() => organizations.id),
		name: text("name").notNull(),
		// Free text for now.
		address: text("address").notNull(),
		// Groups Units into a building or complex (ADR 0005).
		buildingLabel: text("building_label"),
		createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	},
	(table) => [index("units_organization_id_idx").on(table.organizationId)],
);
