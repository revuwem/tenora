import { Controller, ForbiddenException, Get, INestApplication, Param } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { meResponseSchema } from "@tenora/contracts";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { signInCookie } from "../../test/support/http";
import { seedTestOrganization } from "../../test/support/seed-test-organization";
import { AppModule } from "../app.module";
import type { Database } from "../db/db";
import { DATABASE } from "../db/db.module";
import type { Actor } from "./actor";
import { CurrentActor, RequirePermission } from "./authz.decorators";
import { AuthzService } from "./authz.service";
import { memberships } from "./membership.schema";

// Test-only routes that show how a resource controller is guarded.
@Controller("test")
class GuardedRoutes {
	constructor(private readonly authz: AuthzService) {}

	@Get("undeclared")
	undeclared() {
		return { ok: true };
	}

	@Get("units")
	@RequirePermission("units:view")
	units() {
		return { ok: true };
	}

	// The pattern for anything that belongs to an Organization: the permission lets the request
	// in, then the resource's Organization is checked against the actor's.
	@Get("organizations/:organizationId")
	@RequirePermission("units:view")
	organization(@Param("organizationId") organizationId: string, @CurrentActor() actor: Actor) {
		if (!this.authz.can(actor, "units:view", { organizationId })) throw new ForbiddenException();
		return { organizationId };
	}
}

describe("access control", () => {
	let app: INestApplication;
	let server: ReturnType<INestApplication["getHttpServer"]>;
	let db: Database;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
			controllers: [GuardedRoutes],
			providers: [AuthzService],
		}).compile();
		app = moduleRef.createNestApplication({ bodyParser: false });
		await app.init();
		server = app.getHttpServer();
		db = app.get(DATABASE);
	});

	afterAll(async () => {
		await app?.close();
	});

	it("rejects a request without a session", async () => {
		expect((await request(server).get("/test/units")).status).toBe(401);
		expect((await request(server).get("/me")).status).toBe(401);
	});

	it("leaves public routes open", async () => {
		expect((await request(server).get("/health")).status).toBe(200);
	});

	it("rejects a route that declares no access rule, even for an admin", async () => {
		const admin = await seedTestOrganization(db);
		const cookie = await signInCookie(server, admin.adminEmail, admin.adminPassword);
		expect((await request(server).get("/test/undeclared").set("Cookie", cookie)).status).toBe(403);
	});

	it("rejects a user who signed up but has no membership, everywhere", async () => {
		const unique = randomUUID();
		const email = `nobody-${unique}@example.test`;
		const password = `pw-${unique}`;
		await request(server).post("/api/auth/sign-up/email").send({ name: "Nobody", email, password });
		const cookie = await signInCookie(server, email, password);

		expect((await request(server).get("/me").set("Cookie", cookie)).status).toBe(403);
		expect((await request(server).get("/test/units").set("Cookie", cookie)).status).toBe(403);
	});

	it("tells the Admin what they may do on GET /me", async () => {
		const admin = await seedTestOrganization(db);
		const cookie = await signInCookie(server, admin.adminEmail, admin.adminPassword);

		const response = await request(server).get("/me").set("Cookie", cookie);

		expect(response.status).toBe(200);
		expect(meResponseSchema.parse(response.body)).toMatchObject({
			user: { id: admin.adminId, email: admin.adminEmail },
			organizationId: admin.organizationId,
			role: "admin",
			permissions: ["units:view", "units:create"],
		});
		expect((await request(server).get("/test/units").set("Cookie", cookie)).status).toBe(200);
	});

	it("stops letting someone in as soon as their membership is removed", async () => {
		const admin = await seedTestOrganization(db);
		const cookie = await signInCookie(server, admin.adminEmail, admin.adminPassword);
		expect((await request(server).get("/me").set("Cookie", cookie)).status).toBe(200);

		await db.delete(memberships).where(eq(memberships.userId, admin.adminId));

		expect((await request(server).get("/me").set("Cookie", cookie)).status).toBe(403);
	});

	describe("across Organizations", () => {
		it("lets an Admin reach their own Organization's resource but not another's", async () => {
			const a = await seedTestOrganization(db);
			const b = await seedTestOrganization(db);
			const cookieA = await signInCookie(server, a.adminEmail, a.adminPassword);

			const own = await request(server)
				.get(`/test/organizations/${a.organizationId}`)
				.set("Cookie", cookieA);
			const other = await request(server)
				.get(`/test/organizations/${b.organizationId}`)
				.set("Cookie", cookieA);

			expect(own.status).toBe(200);
			expect(other.status).toBe(403);
		});
	});
});
