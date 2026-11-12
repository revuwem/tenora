/**
 * Full URL for an API path.
 *
 * - Browser: NEXT_PUBLIC_API_URL (inlined at build time). In Docker this is
 *   http://localhost:<API_PORT>, which differs per git worktree.
 * - Server (server components, route handlers): API_INTERNAL_URL when set (the Docker
 *   network address, e.g. http://api:8000), otherwise the public URL.
 */
export function apiUrl(path = ""): string {
	const base =
		typeof window === "undefined"
			? (process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL)
			: process.env.NEXT_PUBLIC_API_URL;

	if (!base) {
		throw new Error("NEXT_PUBLIC_API_URL is not set");
	}

	return `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
