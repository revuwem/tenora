"use client";

import { createUnitRequestSchema } from "@tenora/contracts";
import { Button } from "@tenora/ui/components/ui/button";
import { Input } from "@tenora/ui/components/ui/input";
import { useRouter } from "next/navigation";
import { type FormEvent, useId, useState } from "react";

export function CreateUnitForm() {
	const router = useRouter();
	const id = useId();
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
			setError("A Unit needs a name and an address.");
			return;
		}

		setPending(true);
		setError(null);
		try {
			const response = await fetch("/api/units", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify(parsed.data),
			});
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
			<div className="flex flex-col gap-1.5 text-sm font-medium">
				<label htmlFor={`${id}-name`}>Name</label>
				<Input id={`${id}-name`} name="name" placeholder="Flat 4" />
			</div>
			<div className="flex flex-col gap-1.5 text-sm font-medium">
				<label htmlFor={`${id}-address`}>Address</label>
				<Input id={`${id}-address`} name="address" placeholder="12 Rustaveli Ave" />
			</div>
			<div className="flex flex-col gap-1.5 text-sm font-medium">
				<label htmlFor={`${id}-buildingLabel`}>Building (optional)</label>
				<Input id={`${id}-buildingLabel`} name="buildingLabel" placeholder="Block B" />
			</div>
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
