import { Controller, Get, INestApplication, Req } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { randomUUID } from "node:crypto";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { seedTestOrganization } from "../../test/support/seed-test-organization";
import { AppModule } from "../app.module";
import { AuthModule } from "./auth.module";
import type { Database } from "../db/db";
import { DATABASE } from "../db/db.module";
import { CurrentUserService } from "./current-user.service";

// Test-only route, to see what the rest of the api would learn from a request.
@Controller("test")
class WhoAmIController {
	constructor(private readonly currentUser: CurrentUserService) {}

	@Get("who-am-i")
	async whoAmI(@Req() request: { headers: Record<string, string> }) {
		return (await this.currentUser.fromRequest(request)) ?? { user: null };
	}
}

describe("sign-up and sign-in", () => {
	let app: INestApplication;
	let server: ReturnType<INestApplication["getHttpServer"]>;
	let db: Database;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule, AuthModule],
			controllers: [WhoAmIController],
		}).compile();
		app = moduleRef.createNestApplication({ bodyParser: false });
		await app.init();
		server = app.getHttpServer();
		db = app.get(DATABASE);
	});

	afterAll(async () => {
		await app?.close();
	});

	const credentials = () => {
		const unique = randomUUID();
		return { name: "Someone", email: `user-${unique}@example.test`, password: `pw-${unique}` };
	};

	const sessionCookieHeaders = (response: request.Response) =>
		response.headers["set-cookie"] as unknown as string[];
	const sessionCookie = (response: request.Response) =>
		sessionCookieHeaders(response)
			.map((c) => c.split(";")[0])
			.join("; ");

	it("lets a new user sign up and then sign in", async () => {
		const { name, email, password } = credentials();

		const signUp = await request(server)
			.post("/api/auth/sign-up/email")
			.send({ name, email, password });
		expect(signUp.status).toBe(200);
		expect(signUp.body.user.email).toBe(email);

		const signIn = await request(server).post("/api/auth/sign-in/email").send({ email, password });
		expect(signIn.status).toBe(200);
		expect(signIn.body.user.email).toBe(email);
		expect(sessionCookieHeaders(signIn).join(";")).toMatch(/HttpOnly/i);
	});

	it("rejects a wrong password", async () => {
		const { name, email, password } = credentials();
		await request(server).post("/api/auth/sign-up/email").send({ name, email, password });

		const signIn = await request(server)
			.post("/api/auth/sign-in/email")
			.send({ email, password: `${password}-wrong` });
		expect(signIn.status).toBe(401);
		expect(signIn.headers["set-cookie"]).toBeUndefined();
	});

	it("tells the rest of the api who is signed in, and nobody without a session", async () => {
		const { name, email, password } = credentials();
		await request(server).post("/api/auth/sign-up/email").send({ name, email, password });
		const signIn = await request(server).post("/api/auth/sign-in/email").send({ email, password });

		const withSession = await request(server)
			.get("/test/who-am-i")
			.set("Cookie", sessionCookie(signIn));
		expect(withSession.body).toMatchObject({ email, name });

		const withoutSession = await request(server).get("/test/who-am-i");
		expect(withoutSession.body).toEqual({ user: null });
	});

	it("signs in a user written by the seed function", async () => {
		const organization = await seedTestOrganization(db);

		const signIn = await request(server)
			.post("/api/auth/sign-in/email")
			.send({ email: organization.adminEmail, password: organization.adminPassword });
		expect(signIn.status).toBe(200);
		expect(signIn.body.user.id).toBe(organization.adminId);
	});
});
