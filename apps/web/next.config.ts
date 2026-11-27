import path from "node:path";
import type { NextConfig } from "next";
import { apiRewrites } from "./src/lib/api-rewrites";

const nextConfig: NextConfig = {
	/* config options here */
	reactCompiler: true,
	// Self-contained server output (.next/standalone) for the production Docker image.
	output: "standalone",
	// Trace dependencies from the monorepo root so workspace packages (@tenora/ui) and
	// the hoisted node_modules are included in the standalone output.
	outputFileTracingRoot: path.join(__dirname, "../../"),
	// The browser calls the api through this app's own origin (ADR 0003): no CORS, and the session
	// cookie stays first-party. Authorization stays in the api, never here.
	rewrites: async () => apiRewrites(),
};

export default nextConfig;
