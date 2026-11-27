import { requireEnv } from "../common/env";
import { runWithDatabase } from "./db";
import { seedOrganizationAdmin } from "./seeding";

// The Admin's membership (role) is added to the seed with the memberships table.
// Reads the values from the environment (a git-ignored .env locally, see .env.example).
runWithDatabase(async (db) => {
	const { organizationId, userId } = await seedOrganizationAdmin(db, {
		organizationName: requireEnv("ORGANIZATION_NAME"),
		adminName: process.env.ADMIN_NAME || "Admin",
		adminEmail: requireEnv("ADMIN_EMAIL"),
		adminPassword: requireEnv("ADMIN_PASSWORD"),
	});
	console.log(`Seeded organization ${organizationId} with admin ${userId}`);
});
