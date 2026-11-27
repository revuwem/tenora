import Link from "next/link";
import { getMe } from "@/lib/me";

export default async function Home() {
	const result = await getMe();
	const canViewUnits = result.status === "ok" && result.me.permissions.includes("units:view");

	return (
		<div className="mx-auto flex max-w-3xl flex-col gap-4">
			<h1 className="text-2xl font-semibold">Welcome to Tenora</h1>
			<p className="text-sm text-muted-foreground">Rental operations for your Units.</p>
			{canViewUnits && (
				<Link href="/units" className="text-sm font-medium underline underline-offset-4">
					Go to Units
				</Link>
			)}
		</div>
	);
}
