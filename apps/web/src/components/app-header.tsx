import type { MeResponse } from "@tenora/contracts";
import Link from "next/link";
import { SignOutButton } from "./sign-out-button";

/**
 * Navigation for the signed-in user. It only hides what they can't use; the api decides what
 * they may actually do.
 */
export function AppHeader({ me }: { me: MeResponse }) {
	const can = (permission: MeResponse["permissions"][number]) =>
		me.permissions.includes(permission);

	return (
		<header className="flex items-center justify-between border-b px-6 py-3">
			<nav aria-label="Main" className="flex items-center gap-6 text-sm font-medium">
				<Link href="/" className="text-base font-semibold">
					Tenora
				</Link>
				{can("units:view") && <Link href="/units">Units</Link>}
			</nav>
			<div className="flex items-center gap-3 text-sm">
				<span className="text-muted-foreground">{me.user.email}</span>
				<SignOutButton />
			</div>
		</header>
	);
}
