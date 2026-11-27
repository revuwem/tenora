import { hashPassword, verifyPassword } from "better-auth/crypto";

// The only place password hashing is chosen. Better Auth signs users in with these (see
// auth.config.ts) and the seed writes credentials with the same functions, so the two agree.
// Both are Better Auth's own scrypt implementation.
export const password = { hash: hashPassword, verify: verifyPassword };
