import { type ExecutionContext, ForbiddenException, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { describe, expect, it, vi } from "vitest";
import { Public } from "../auth/public";
import type { CurrentUserService } from "../auth/current-user.service";
import type { Actor } from "./actor";
import { AnyMember, RequirePermission } from "./authz.decorators";
import { AuthzGuard } from "./authz.guard";
import type { AuthzService } from "./authz.service";
import type { MembershipsRepository } from "./memberships.repository";

class Routes {
	@Public() open() {}
	@RequirePermission("units:view") list() {}
	@AnyMember() me() {}
	undeclared() {}
}

const user = { id: "u1", email: "a@example.test", name: "A" };
const member: Actor = { user, organizationId: "org-a", role: "admin" };

function setup(options: { signedIn?: boolean; member?: boolean; allowed?: boolean } = {}) {
	const { signedIn = true, member: isMember = true, allowed = true } = options;
	const request: { actor?: Actor } = {};
	const currentUser = { fromRequest: vi.fn(async () => (signedIn ? user : null)) };
	const memberships = { findActorByUserId: vi.fn(async () => (isMember ? member : undefined)) };
	const authz = { can: vi.fn(() => allowed) };
	const guard = new AuthzGuard(
		new Reflector(),
		currentUser as unknown as CurrentUserService,
		memberships as unknown as MembershipsRepository,
		authz as unknown as AuthzService,
	);
	const contextFor = (route: keyof Routes) =>
		({
			getHandler: () => Routes.prototype[route],
			getClass: () => Routes,
			switchToHttp: () => ({ getRequest: () => request }),
		}) as unknown as ExecutionContext;
	return { guard, contextFor, request, currentUser, memberships, authz };
}

describe("AuthzGuard", () => {
	it("lets anyone reach a public route without looking anyone up", async () => {
		const { guard, contextFor, currentUser } = setup({ signedIn: false });
		await expect(guard.canActivate(contextFor("open"))).resolves.toBe(true);
		expect(currentUser.fromRequest).not.toHaveBeenCalled();
	});

	it("rejects a route that declares no access rule, even for an admin", async () => {
		const { guard, contextFor } = setup();
		await expect(guard.canActivate(contextFor("undeclared"))).rejects.toBeInstanceOf(
			ForbiddenException,
		);
	});

	it("answers 401 when there is no session", async () => {
		const { guard, contextFor } = setup({ signedIn: false });
		await expect(guard.canActivate(contextFor("list"))).rejects.toBeInstanceOf(
			UnauthorizedException,
		);
	});

	it("answers 403 to a signed-in user with no membership", async () => {
		const { guard, contextFor } = setup({ member: false });
		await expect(guard.canActivate(contextFor("list"))).rejects.toBeInstanceOf(ForbiddenException);
		await expect(guard.canActivate(contextFor("me"))).rejects.toBeInstanceOf(ForbiddenException);
	});

	it("answers 403 when the role lacks the permission", async () => {
		const { guard, contextFor, authz } = setup({ allowed: false });
		await expect(guard.canActivate(contextFor("list"))).rejects.toBeInstanceOf(ForbiddenException);
		expect(authz.can).toHaveBeenCalledWith(member, "units:view");
	});

	it("lets a member with the permission in, and hands the route the actor", async () => {
		const { guard, contextFor, request } = setup();
		await expect(guard.canActivate(contextFor("list"))).resolves.toBe(true);
		expect(request.actor).toEqual(member);
	});

	it("lets any member reach a route that only needs a membership", async () => {
		const { guard, contextFor, authz } = setup();
		await expect(guard.canActivate(contextFor("me"))).resolves.toBe(true);
		expect(authz.can).not.toHaveBeenCalled();
	});
});
