import { createParamDecorator, type ExecutionContext, SetMetadata } from "@nestjs/common";
import type { Permission } from "@tenora/contracts";
import type { Actor } from "./actor";

export const PUBLIC_KEY = "authz:public";
export const PERMISSION_KEY = "authz:permission";
export const ANY_MEMBER_KEY = "authz:any-member";

/**
 * The route is open to anyone, signed in or not. Better Auth's own routes (/api/auth/*) are
 * not Nest controllers, so this guard never sees them: they are open by construction.
 */
export const Public = () => SetMetadata(PUBLIC_KEY, true);

/** The route needs this permission. Every route declares this, `@AnyMember()` or `@Public()`. */
export const RequirePermission = (permission: Permission) =>
	SetMetadata(PERMISSION_KEY, permission);

/** The route needs a membership in an Organization, but no particular permission. */
export const AnyMember = () => SetMetadata(ANY_MEMBER_KEY, true);

/**
 * The signed-in user acting in their Organization, set by AuthzGuard. Only for routes that
 * declare `@RequirePermission` or `@AnyMember`: on a `@Public` route nobody is looked up.
 */
export const CurrentActor = createParamDecorator(
	(_data: unknown, context: ExecutionContext): Actor => context.switchToHttp().getRequest().actor,
);
