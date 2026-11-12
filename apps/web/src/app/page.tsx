import { Button } from "@tenora/ui/components/ui/button";

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-6">
			<h1 className="text-3xl font-semibold">Hello, world!</h1>
			<Button disabled>Get started</Button>
		</main>
	);
}
