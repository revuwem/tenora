import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { user as users } from "../auth/auth.schema";
import type { Database } from "../db/db";
import { DATABASE } from "../db/db.module";
import type { Actor } from "./actor";
import { memberships } from "./membership.schema";

@Injectable()
export class MembershipsRepository {
	constructor(@Inject(DATABASE) private readonly db: Database) {}

	/** The user with the Organization and role they hold, read fresh on every call. */
	async findActorByUserId(userId: string): Promise<Actor | undefined> {
		const [row] = await this.db
			.select({
				id: users.id,
				email: users.email,
				name: users.name,
				organizationId: memberships.organizationId,
				role: memberships.role,
			})
			.from(memberships)
			.innerJoin(users, eq(users.id, memberships.userId))
			.where(eq(memberships.userId, userId))
			.limit(1);
		if (!row) return undefined;
		return {
			user: { id: row.id, email: row.email, name: row.name },
			organizationId: row.organizationId,
			role: row.role,
		};
	}
}
