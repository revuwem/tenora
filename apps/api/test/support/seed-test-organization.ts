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
 * so tests can share one database.
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

/**
 * The start of every cross-Organization test: two Organizations, each with its own Admin.
 * Sign in as each (`signInCookie`), have A create something through the api, then check that
 * B's Admin can neither see it nor change it, and that A still can.
 */
export async function seedTwoOrganizations(db: Database) {
	return { a: await seedTestOrganization(db), b: await seedTestOrganization(db) };
}
