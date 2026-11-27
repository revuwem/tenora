import type { ExecutionContext } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import { AllowAnonymous } from "@thallesp/nestjs-better-auth";

/** Marks a route (or controller) as open to anyone, signed in or not. */
export const Public = AllowAnonymous;

// Better Auth's own routes carry the library's marker, so the access control guard has to
// read that one too. This keeps the library's metadata key in the auth module.
export function isPublicRoute(reflector: Reflector, context: ExecutionContext): boolean {
	return (
		reflector.getAllAndOverride<boolean>("PUBLIC", [context.getHandler(), context.getClass()]) ===
		true
	);
}
