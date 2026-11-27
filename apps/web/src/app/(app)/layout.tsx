import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { SignOutButton } from "@/components/sign-out-button";
import { getMe } from "@/lib/me";

// Who is signed in is asked of the api on every request; nothing here decides access.
export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	const result = await getMe();
	if (result.status === "signed-out") redirect("/sign-in");
	if (result.status === "no-access") {
		return (
			<main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
				<h1 className="text-2xl font-semibold">No access yet</h1>
				<p className="max-w-md text-sm text-muted-foreground">
					Your account does not belong to an Organization yet. Ask an Admin to add you.
				</p>
				<SignOutButton />
			</main>
		);
	}

	return (
		<div className="flex min-h-screen flex-col">
			<AppHeader me={result.me} />
			<main className="flex-1 p-6">{children}</main>
		</div>
	);
}
