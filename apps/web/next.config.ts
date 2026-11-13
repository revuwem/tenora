import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	reactCompiler: true,
	// Self-contained server output (.next/standalone) for the production Docker image.
	output: "standalone",
	// Trace dependencies from the monorepo root so workspace packages (@tenora/ui) and
	// the hoisted node_modules are included in the standalone output.
	outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;
