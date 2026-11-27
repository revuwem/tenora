"use client";

import { Button } from "@tenora/ui/components/ui/button";
import { useRouter } from "next/navigation";

export function SignOutButton() {
	const router = useRouter();

	async function signOut() {
		await fetch("/api/auth/sign-out", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: "{}",
		});
		router.push("/sign-in");
		router.refresh();
	}

	return (
		<Button variant="outline" size="sm" onClick={signOut}>
			Sign out
		</Button>
	);
}
