import { z } from "zod";

const requiredText = z.string().trim().min(1);

/** `POST /units`. A Unit has a name and an address (both required) and an optional building label. */
export const createUnitRequestSchema = z.object({
	name: requiredText,
	address: requiredText,
	buildingLabel: z
		.string()
		.trim()
		.optional()
		.transform((label) => label || undefined),
});
export type CreateUnitRequest = z.infer<typeof createUnitRequestSchema>;

export const unitSchema = z.object({
	id: z.string(),
	name: z.string(),
	address: z.string(),
	buildingLabel: z.string().nullable(),
});
export type Unit = z.infer<typeof unitSchema>;

/** `GET /units`. */
export const listUnitsResponseSchema = z.array(unitSchema);
export type ListUnitsResponse = z.infer<typeof listUnitsResponseSchema>;
