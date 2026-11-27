import { cookies } from "next/headers";
import { apiInternalUrl } from "./api-rewrites";

/** The api's address for server components: the internal network, not the browser's `/api`. */
export function apiUrl(path: string): string {
	return `${apiInternalUrl()}/${path.replace(/^\//, "")}`;
}

/** Calls the api as the signed-in user, forwarding their session cookie. Server components only. */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
	const cookie = (await cookies()).toString();
	return fetch(apiUrl(path), {
		...init,
		headers: { ...init.headers, cookie },
		cache: "no-store",
	});
}
