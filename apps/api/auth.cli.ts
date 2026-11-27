// Only read by the Better Auth CLI (`bun run auth:generate`), which needs a config file
// exporting `auth`. A mock database is enough: generating the schema only reads the options.
import { drizzle } from "drizzle-orm/node-postgres";
import { createAuth } from "./src/auth/auth.config";

export const auth = createAuth(drizzle.mock(), {
	secret: "only-used-to-generate-the-schema-000",
	baseURL: "http://localhost:3000",
});
