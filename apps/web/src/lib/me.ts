import { type MeResponse, meResponseSchema } from "@tenora/contracts";
import { apiFetch } from "./api";

export type MeResult =
	| { status: "signed-out" }
	| { status: "no-access" }
	| { status: "ok"; me: MeResponse };

/** Who is signed in. `no-access` is a user who signed up but belongs to no Organization yet. */
export async function getMe(): Promise<MeResult> {
	const response = await apiFetch("/me");
	if (response.status === 401) return { status: "signed-out" };
	if (response.status === 403) return { status: "no-access" };
	if (!response.ok) throw new Error(`GET /me failed with ${response.status}`);
	return { status: "ok", me: meResponseSchema.parse(await response.json()) };
}
