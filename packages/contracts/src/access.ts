import { z } from "zod";

/** Every permission, as `resource:action`. The api checks these, never role names. */
export const PERMISSIONS = ["units:view", "units:create"] as const;
export const permissionSchema = z.enum(PERMISSIONS);
export type Permission = z.infer<typeof permissionSchema>;

/** Only the Admin preset exists for now. */
export const ROLES = ["admin"] as const;
export const roleSchema = z.enum(ROLES);
export type Role = z.infer<typeof roleSchema>;

/** `GET /me`: who is signed in and what they may do, so the web app can hide what they can't. */
export const meResponseSchema = z.object({
	user: z.object({ id: z.string(), email: z.string(), name: z.string() }),
	organizationId: z.string(),
	role: roleSchema,
	permissions: z.array(permissionSchema),
});
export type MeResponse = z.infer<typeof meResponseSchema>;
