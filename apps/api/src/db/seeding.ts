import { and, eq } from "drizzle-orm";
import { account, user } from "../auth/auth.schema";
import { password } from "../auth/password";
import { memberships } from "../authz/membership.schema";
import { organizations } from "../domain/organizations/organization.schema";
import type { Database } from "./db";

export interface SeedInput {
	organizationName: string;
	adminName: string;
	adminEmail: string;
	adminPassword: string;
}

/**
 * Writes an Organization, its Admin and the Admin's membership straight into the tables,
 * calling no API. Safe to run again: anything already there is left as it is (an existing
 * Admin keeps their password).
 */
export async function seedOrganizationAdmin(db: Database, input: SeedInput) {
	return db.transaction(async (tx) => {
		const [existingOrganization] = await tx
			.select({ id: organizations.id })
			.from(organizations)
			.where(eq(organizations.name, input.organizationName))
			.limit(1);
		const organizationId =
			existingOrganization?.id ??
			(
				await tx
					.insert(organizations)
					.values({ name: input.organizationName })
					.returning({ id: organizations.id })
			)[0].id;

		const [existingUser] = await tx
			.select({ id: user.id })
			.from(user)
			.where(eq(user.email, input.adminEmail))
			.limit(1);
		const userId =
			existingUser?.id ??
			(
				await tx
					.insert(user)
					.values({ name: input.adminName, email: input.adminEmail, emailVerified: true })
					.returning({ id: user.id })
			)[0].id;

		// Better Auth's email and password sign-in: provider "credential", accountId = user id.
		const [existingCredential] = await tx
			.select({ id: account.id })
			.from(account)
			.where(and(eq(account.userId, userId), eq(account.providerId, "credential")))
			.limit(1);
		if (!existingCredential) {
			await tx.insert(account).values({
				accountId: userId,
				providerId: "credential",
				userId,
				password: await password.hash(input.adminPassword),
			});
		}

		// One Organization per user (unique user_id): an existing membership stays as it is.
		await tx
			.insert(memberships)
			.values({ userId, organizationId, role: "admin" })
			.onConflictDoNothing({ target: memberships.userId });

		return { organizationId, userId };
	});
}
