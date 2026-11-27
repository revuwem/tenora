import { type ListUnitsResponse, listUnitsResponseSchema } from "@tenora/contracts";
import { apiFetch } from "./api";

export async function listUnits(): Promise<ListUnitsResponse> {
	const response = await apiFetch("/units");
	if (!response.ok) throw new Error(`GET /units failed with ${response.status}`);
	return listUnitsResponseSchema.parse(await response.json());
}
