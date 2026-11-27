import { eq } from "drizzle-orm";
import { requireEnv } from "../common/env";
import { organizations } from "../domain/organizations/organization.schema";
import { runWithDatabase } from "./db";

// Writes rows directly and calls no API. Safe to run again: it only adds what is missing.
runWithDatabase(async (db) => {
	const name = requireEnv("ORGANIZATION_NAME");
	const [existing] = await db
		.select({ id: organizations.id })
		.from(organizations)
		.where(eq(organizations.name, name))
		.limit(1);
	if (existing) {
		console.log(`Organization "${name}" already exists`);
		return;
	}
	await db.insert(organizations).values({ name });
	console.log(`Organization "${name}" created`);
});
