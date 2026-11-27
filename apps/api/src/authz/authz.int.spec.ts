import { Body, Controller, Get, INestApplication, Post } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { meResponseSchema } from "@tenora/contracts";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { signInCookie } from "../../test/support/http";
import {
	seedTestOrganization,
	seedTwoOrganizations,
} from "../../test/support/seed-test-organization";
import { AppModule } from "../app.module";
import type { Database } from "../db/db";
import { DATABASE } from "../db/db.module";
import type { Actor } from "./actor";
import { CurrentActor, RequirePermission } from "./authz.decorators";
import { memberships } from "./membership.schema";

// Test-only routes that show how a resource controller is guarded: the permission lets the
// request in, and the Organization comes from the signed-in user, never from the request.
@Controller("test")
class GuardedRoutes {
	private readonly notes = new Map<string, string[]>();

	@Get("undeclared")
	undeclared() {
		return { ok: true };
	}

	@Get("notes")
	@RequirePermission("units:view")
	list(@CurrentActor() actor: Actor) {
		return this.notes.get(actor.organizationId) ?? [];
	}

	@Post("notes")
	@RequirePermission("units:create")
	create(@Body("text") text: string, @CurrentActor() actor: Actor) {
		this.notes.set(actor.organizationId, [...(this.notes.get(actor.organizationId) ?? []), text]);
		return { ok: true };
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
		expect((await request(server).get("/test/notes")).status).toBe(401);
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
		expect((await request(server).get("/test/notes").set("Cookie", cookie)).status).toBe(403);
	});

	it("tells the Admin what they may do on GET /me", async () => {
		const admin = await seedTestOrganization(db);
		const cookie = await signInCookie(server, admin.adminEmail, admin.adminPassword);

		const response = await request(server).get("/me").set("Cookie", cookie);

		expect(response.status).toBe(200);
		expect(meResponseSchema.parse(response.body)).toMatchObject({
			user: { id: admin.adminId, email: admin.adminEmail },
			permissions: ["units:view", "units:create"],
		});
		expect((await request(server).get("/test/notes").set("Cookie", cookie)).status).toBe(200);
	});

	it("stops letting someone in as soon as their membership is removed", async () => {
		const admin = await seedTestOrganization(db);
		const cookie = await signInCookie(server, admin.adminEmail, admin.adminPassword);
		expect((await request(server).get("/me").set("Cookie", cookie)).status).toBe(200);

		await db.delete(memberships).where(eq(memberships.userId, admin.adminId));

		expect((await request(server).get("/me").set("Cookie", cookie)).status).toBe(403);
	});

	it("allows only one membership per user", async () => {
		const a = await seedTestOrganization(db);
		const b = await seedTestOrganization(db);

		await expect(
			db
				.insert(memberships)
				.values({ userId: a.adminId, organizationId: b.organizationId, role: "admin" }),
		).rejects.toThrow();
	});

	describe("across Organizations", () => {
		it("keeps one Organization's data from another's Admin", async () => {
			const { a, b } = await seedTwoOrganizations(db);
			const cookieA = await signInCookie(server, a.adminEmail, a.adminPassword);
			const cookieB = await signInCookie(server, b.adminEmail, b.adminPassword);

			await request(server).post("/test/notes").set("Cookie", cookieA).send({ text: "A's note" });
			await request(server).post("/test/notes").set("Cookie", cookieB).send({ text: "B's note" });

			const seenByA = await request(server).get("/test/notes").set("Cookie", cookieA);
			const seenByB = await request(server).get("/test/notes").set("Cookie", cookieB);
			expect(seenByA.body).toEqual(["A's note"]);
			expect(seenByB.body).toEqual(["B's note"]);
		});
	});
});
