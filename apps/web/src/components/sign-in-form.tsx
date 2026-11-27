"use client";

import { Button } from "@tenora/ui/components/ui/button";
import { Input } from "@tenora/ui/components/ui/input";
import { useRouter } from "next/navigation";
import { type FormEvent, useId, useState } from "react";

export function SignInForm() {
	const router = useRouter();
	const id = useId();
	const [error, setError] = useState<string | null>(null);
	const [pending, setPending] = useState(false);

	async function onSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const data = new FormData(event.currentTarget);
		setPending(true);
		setError(null);
		try {
			const response = await fetch("/api/auth/sign-in/email", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ email: data.get("email"), password: data.get("password") }),
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
			<div className="flex flex-col gap-1.5 text-sm font-medium">
				<label htmlFor={`${id}-email`}>Email</label>
				<Input id={`${id}-email`} name="email" type="email" autoComplete="email" required />
			</div>
			<div className="flex flex-col gap-1.5 text-sm font-medium">
				<label htmlFor={`${id}-password`}>Password</label>
				<Input
					id={`${id}-password`}
					name="password"
					type="password"
					autoComplete="current-password"
					required
				/>
			</div>
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
