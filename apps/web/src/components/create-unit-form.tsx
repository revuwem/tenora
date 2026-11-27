"use client";

import { createUnitRequestSchema } from "@tenora/contracts";
import { Button } from "@tenora/ui/components/ui/button";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { postJson } from "@/lib/post-json";
import { FormField } from "./form-field";

const missingFieldMessage = { name: "A Unit needs a name.", address: "A Unit needs an address." };

export function CreateUnitForm() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const form = event.currentTarget;
		const data = new FormData(form);
		const parsed = createUnitRequestSchema.safeParse({
			name: data.get("name"),
			address: data.get("address"),
			buildingLabel: data.get("buildingLabel"),
		});
		if (!parsed.success) {
			const field = parsed.error.issues[0]?.path[0];
			setError(field === "address" ? missingFieldMessage.address : missingFieldMessage.name);
			return;
		}

		setPending(true);
		setError(null);
		try {
			const response = await postJson("/api/units", parsed.data);
			if (!response.ok) {
				setError("The Unit could not be created. Try again.");
				return;
			}
			form.reset();
			router.refresh();
		} catch {
			setError("Could not reach the server. Try again.");
		} finally {
			setPending(false);
		}
	}

	return (
		<form onSubmit={onSubmit} className="flex flex-col gap-4">
			<h2 className="text-lg font-semibold">Add a Unit</h2>
			<FormField label="Name" name="name" placeholder="Flat 4" />
			<FormField label="Address" name="address" placeholder="12 Rustaveli Ave" />
			<FormField label="Building (optional)" name="buildingLabel" placeholder="Block B" />
			{error && (
				<p role="alert" className="text-sm text-destructive">
					{error}
				</p>
			)}
			<Button type="submit" disabled={pending} className="self-start">
				{pending ? "Adding…" : "Add Unit"}
			</Button>
		</form>
	);
}
