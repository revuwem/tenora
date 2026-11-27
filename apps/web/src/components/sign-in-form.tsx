"use client";

import { Button } from "@tenora/ui/components/ui/button";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { postJson } from "@/lib/post-json";
import { FormField } from "./form-field";

export function SignInForm() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		setPending(true);
		setError(null);
		try {
			const response = await postJson("/api/auth/sign-in/email", {
				email: data.get("email"),
				password: data.get("password"),
			});
			if (!response.ok) {
				setError("Wrong email or password.");
				return;
			}
			router.push("/");
			router.refresh();
		} catch {
			setError("Could not reach the server. Try again.");
		} finally {
			setPending(false);
		}
	}

	return (
		<form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
			<FormField label="Email" name="email" type="email" autoComplete="email" required />
			<FormField
				label="Password"
				name="password"
				type="password"
				autoComplete="current-password"
				required
			/>
			{error && (
				<p role="alert" className="text-sm text-destructive">
					{error}
				</p>
			)}
			<Button type="submit" disabled={pending}>
				{pending ? "Signing in…" : "Sign in"}
			</Button>
		</form>
	);
}
