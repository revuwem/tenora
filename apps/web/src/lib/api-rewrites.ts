/**
 * Where the web app reaches the api over the internal network (ADR 0003). Fixed configuration:
 * it comes from the environment, never from a request. Next.js reads it for the rewrites when
 * the app is built (see the Dockerfile), and server components read it at run time.
 */
export function apiInternalUrl(): string {
	return (process.env.API_INTERNAL_URL || "http://localhost:8000").replace(/\/$/, "");
}

/**
 * The browser calls `/api/*` on the web app's own origin. Better Auth lives at /api/auth on the
 * api; every other route is served without the prefix. Cookies and query strings pass through.
 */
export function apiRewrites(baseUrl = apiInternalUrl()) {
	return [
		{ source: "/api/auth/:path*", destination: `${baseUrl}/api/auth/:path*` },
		{ source: "/api/:path*", destination: `${baseUrl}/:path*` },
	];
}
