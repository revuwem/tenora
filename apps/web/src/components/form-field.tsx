"use client";

import { Input } from "@tenora/ui/components/ui/input";
import type * as React from "react";
import { useId } from "react";

/** A label tied to its input. */
export function FormField({
	label,
	...inputProps
}: { label: string } & Omit<React.ComponentProps<"input">, "id">) {
	const id = useId();
	return (
		<div className="flex flex-col gap-1.5 text-sm font-medium">
			<label htmlFor={id}>{label}</label>
			<Input id={id} {...inputProps} />
		</div>
	);
}
