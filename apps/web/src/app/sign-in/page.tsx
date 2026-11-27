import { redirect } from "next/navigation";
import { SignInForm } from "@/components/sign-in-form";
import { getMe } from "@/lib/me";

export const dynamic = "force-dynamic";

export default async function SignInPage() {
	if ((await getMe()).status === "ok") redirect("/");

	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
			<h1 className="text-2xl font-semibold">Sign in to Tenora</h1>
			<SignInForm />
		</main>
	);
}
