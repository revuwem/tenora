"use client";

import { Button } from "@tenora/ui/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { postJson } from "@/lib/post-json";

export function SignOutButton() {
	const router = useRouter();
	const [pending, setPending] = useState(false);

	async function signOut() {
		setPending(true);
		try {
			await postJson("/api/auth/sign-out", {});
		} catch {
			// Still signed in: stay put and let them try again.
			setPending(false);
			return;
		}
		router.push("/sign-in");
		router.refresh();
	}

	return (
		<Button variant="outline" size="sm" onClick={signOut} disabled={pending}>
			Sign out
		</Button>
	);
}
