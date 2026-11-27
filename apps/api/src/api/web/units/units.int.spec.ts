import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { listUnitsResponseSchema, unitSchema } from "@tenora/contracts";
import { randomUUID } from "node:crypto";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { signInCookie } from "../../../../test/support/http";
import {
	seedTestOrganization,
	seedTwoOrganizations,
} from "../../../../test/support/seed-test-organization";
import { AppModule } from "../../../app.module";
import type { Database } from "../../../db/db";
import { DATABASE } from "../../../db/db.module";

describe("Units API", () => {
	let app: INestApplication;
	let server: ReturnType<INestApplication["getHttpServer"]>;
	let db: Database;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
		app = moduleRef.createNestApplication({ bodyParser: false });
		await app.init();
		server = app.getHttpServer();
		db = app.get(DATABASE);
	});

	afterAll(async () => {
		await app?.close();
	});

	const createUnit = (cookie: string, body: object) =>
		request(server).post("/units").set("Cookie", cookie).send(body);
	const listUnits = (cookie: string) => request(server).get("/units").set("Cookie", cookie);

	describe("for the Admin", () => {
		it("starts with no Units, then lists a Unit once it is created", async () => {
			const admin = await seedTestOrganization(db);
			const cookie = await signInCookie(server, admin.adminEmail, admin.adminPassword);

			const before = await listUnits(cookie);
			expect(before.status).toBe(200);
			expect(before.body).toEqual([]);

			const created = await createUnit(cookie, {
				name: "Flat 4",
				address: "12 Rustaveli Ave",
				buildingLabel: "Block B",
			});
			expect(created.status).toBe(201);
			expect(unitSchema.parse(created.body)).toMatchObject({
				name: "Flat 4",
				address: "12 Rustaveli Ave",
				buildingLabel: "Block B",
			});

			const after = await listUnits(cookie);
			expect(listUnitsResponseSchema.parse(after.body)).toEqual([created.body]);
		});

		it("stores no building label as null", async () => {
			const admin = await seedTestOrganization(db);
			const cookie = await signInCookie(server, admin.adminEmail, admin.adminPassword);

			const created = await createUnit(cookie, { name: "Flat 5", address: "14 Rustaveli Ave" });

			expect(created.status).toBe(201);
			expect(created.body.buildingLabel).toBeNull();
		});

		it.each([
			["a missing name", { address: "12 Rustaveli Ave" }],
			["a missing address", { name: "Flat 4" }],
			["a blank name", { name: "  ", address: "12 Rustaveli Ave" }],
		])("rejects %s with 400", async (_label, body) => {
			const admin = await seedTestOrganization(db);
			const cookie = await signInCookie(server, admin.adminEmail, admin.adminPassword);

			const created = await createUnit(cookie, body);

			expect(created.status).toBe(400);
			expect((await listUnits(cookie)).body).toEqual([]);
		});
	});

	describe("without access", () => {
		it("rejects requests without a session", async () => {
			expect((await request(server).get("/units")).status).toBe(401);
			expect((await request(server).post("/units").send({ name: "x", address: "y" })).status).toBe(
				401,
			);
		});

		it("rejects a signed-up user who has no membership", async () => {
			const unique = randomUUID();
			const email = `nobody-${unique}@example.test`;
			const password = `pw-${unique}`;
			await request(server)
				.post("/api/auth/sign-up/email")
				.send({ name: "Nobody", email, password });
			const cookie = await signInCookie(server, email, password);

			expect((await listUnits(cookie)).status).toBe(403);
			expect((await createUnit(cookie, { name: "x", address: "y" })).status).toBe(403);
		});
	});

	describe("across Organizations", () => {
		it("keeps one Organization's Units from another's Admin", async () => {
			const { a, b } = await seedTwoOrganizations(db);
			const cookieA = await signInCookie(server, a.adminEmail, a.adminPassword);
			const cookieB = await signInCookie(server, b.adminEmail, b.adminPassword);

			const unitOfA = await createUnit(cookieA, { name: "A's flat", address: "1 A Street" });
			const unitOfB = await createUnit(cookieB, { name: "B's flat", address: "1 B Street" });

			expect((await listUnits(cookieA)).body).toEqual([unitOfA.body]);
			expect((await listUnits(cookieB)).body).toEqual([unitOfB.body]);
		});

		it("takes the Organization from the signed-in user, not from the request", async () => {
			const { a, b } = await seedTwoOrganizations(db);
			const cookieA = await signInCookie(server, a.adminEmail, a.adminPassword);
			const cookieB = await signInCookie(server, b.adminEmail, b.adminPassword);

			const created = await createUnit(cookieA, {
				name: "A's flat",
				address: "1 A Street",
				organizationId: b.organizationId,
			});

			expect(created.status).toBe(201);
			expect((await listUnits(cookieA)).body).toEqual([created.body]);
			expect((await listUnits(cookieB)).body).toEqual([]);
		});
	});
});
