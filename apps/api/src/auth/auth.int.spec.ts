import { Controller, Get, INestApplication, Req } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { Test } from "@nestjs/testing";
import { eq } from "drizzle-orm";
import { randomUUID } from "node:crypto";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { seedTestOrganization } from "../../test/support/seed-test-organization";
import { configureApp } from "../app.setup";
import { AppModule } from "../app.module";
import { Public } from "../authz/authz.decorators";
import { AuthModule } from "./auth.module";
import type { Database } from "../db/db";
import { DATABASE } from "../db/db.module";
import { CLIENT_IP_HEADER } from "../common/client-ip";
import { session } from "./auth.schema";
import { CurrentUserService } from "./current-user.service";

// Test-only route, to see what the rest of the api would learn from a request.
@Controller("test")
class WhoAmIController {
	constructor(private readonly currentUser: CurrentUserService) {}

	@Get("who-am-i")
	@Public()
	async whoAmI(@Req() request: { headers: Record<string, string> }) {
		return (await this.currentUser.fromRequest(request)) ?? { user: null };
	}
}

describe("sign-up and sign-in", () => {
	let app: NestExpressApplication;
	let server: ReturnType<INestApplication["getHttpServer"]>;
	let db: Database;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule, AuthModule],
			controllers: [WhoAmIController],
		}).compile();
		app = moduleRef.createNestApplication<NestExpressApplication>({ bodyParser: false });
		configureApp(app);
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

	const signUp = (user: { name: string; email: string; password: string }) =>
		request(server).post("/api/auth/sign-up/email").send(user);
	const signIn = (email: string, password: string) =>
		request(server).post("/api/auth/sign-in/email").send({ email, password });

	const sessionCookieHeaders = (response: request.Response) =>
		response.headers["set-cookie"] as unknown as string[];
	const sessionCookie = (response: request.Response) =>
		sessionCookieHeaders(response)
			.map((c) => c.split(";")[0])
			.join("; ");

	it("lets a new user sign up and then sign in", async () => {
		const user = credentials();

		const signedUp = await signUp(user);
		expect(signedUp.status).toBe(200);
		expect(signedUp.body.user.email).toBe(user.email);

		const signedIn = await signIn(user.email, user.password);
		expect(signedIn.status).toBe(200);
		expect(signedIn.body.user.email).toBe(user.email);
		expect(sessionCookieHeaders(signedIn).join(";")).toMatch(/HttpOnly/i);
	});

	describe("the client address Better Auth records", () => {
		// What a client could send, then what a trusted reverse proxy would append.
		const signInFromBehindProxy = async (target: INestApplication) => {
			const user = credentials();
			await request(target.getHttpServer()).post("/api/auth/sign-up/email").send(user);
			const signedIn = await request(target.getHttpServer())
				.post("/api/auth/sign-in/email")
				.set("X-Forwarded-For", "1.2.3.4, 9.9.9.9")
				.set(CLIENT_IP_HEADER, "6.6.6.6")
				.send({ email: user.email, password: user.password });
			const [row] = await db
				.select({ ipAddress: session.ipAddress })
				.from(session)
				.where(eq(session.token, signedIn.body.token));
			return row.ipAddress;
		};

		it("ignores every address the client wrote, by default", async () => {
			// Better Auth reports localhost when it has no address and NODE_ENV is "test", so
			// this fails only if one of the client's own values got through.
			expect(await signInFromBehindProxy(app)).toBe("127.0.0.1");
		});

		it("takes the address a trusted proxy saw, when told to trust one hop", async () => {
			const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
			const trusting = moduleRef.createNestApplication<NestExpressApplication>({
				bodyParser: false,
			});
			configureApp(trusting, { trustedProxyHops: 1 });
			await trusting.init();
			try {
				expect(await signInFromBehindProxy(trusting)).toBe("9.9.9.9");
			} finally {
				await trusting.close();
			}
		});
	});

	it("rejects a wrong password", async () => {
		const user = credentials();
		await signUp(user);

		const signedIn = await signIn(user.email, `${user.password}-wrong`);
		expect(signedIn.status).toBe(401);
		expect(signedIn.headers["set-cookie"]).toBeUndefined();
	});

	it("tells the rest of the api who is signed in, and nobody without a session", async () => {
		const admin = await seedTestOrganization(db);
		const signedIn = await signIn(admin.adminEmail, admin.adminPassword);

		const withSession = await request(server)
			.get("/test/who-am-i")
			.set("Cookie", sessionCookie(signedIn));
		expect(withSession.body).toMatchObject({ id: admin.adminId, email: admin.adminEmail });

		const withoutSession = await request(server).get("/test/who-am-i");
		expect(withoutSession.body).toEqual({ user: null });
	});
});
