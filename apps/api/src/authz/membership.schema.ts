import { ROLES } from "@tenora/contracts";
import { pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "../auth/auth.schema";
import { organizations } from "../domain/organizations/organization.schema";

export const membershipRole = pgEnum("membership_role", ROLES);

/** Links a user to the one Organization they belong to, with their role there. */
export const memberships = pgTable("memberships", {
	id: uuid("id").primaryKey().defaultRandom(),
	// unique: a user belongs to exactly one Organization (ADR 0004). Allowing several later
	// means dropping this constraint.
	userId: uuid("user_id")
		.notNull()
		.unique()
		.references(() => user.id, { onDelete: "cascade" }),
	organizationId: uuid("organization_id")
		.notNull()
		.references(() => organizations.id),
	role: membershipRole("role").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
