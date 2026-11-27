import { randomUUID } from "node:crypto";
import type { Database } from "../../src/db/db";
import { seedOrganizationAdmin } from "../../src/db/seeding";

export interface TestOrganization {
	organizationId: string;
	adminId: string;
	adminEmail: string;
	adminPassword: string;
}

/**
 * An Organization with its own Admin, made by the real seed function with unique fake values,
 * so tests can share one database. Call it twice for the cross-Organization tests.
 */
export async function seedTestOrganization(db: Database): Promise<TestOrganization> {
	const unique = randomUUID();
	const adminEmail = `admin-${unique}@example.test`;
	const adminPassword = `pw-${unique}`;
	const { organizationId, userId } = await seedOrganizationAdmin(db, {
		organizationName: `Organization ${unique}`,
		adminName: "Test Admin",
		adminEmail,
		adminPassword,
	});
	return { organizationId, adminId: userId, adminEmail, adminPassword };
}
