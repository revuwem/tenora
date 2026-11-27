import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

// next/link needs a Next.js runtime; a plain anchor is enough to check the links.
vi.mock("next/link", () => ({
	__esModule: true,
	default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));

import { AppHeader } from "./app-header";

const user = { id: "u1", email: "admin@example.com", name: "Admin" };

describe("AppHeader", () => {
	it("shows who is signed in and a Units link to someone who can view Units", async () => {
		const screen = await render(
			<AppHeader me={{ user, permissions: ["units:view", "units:create"] }} />,
		);

		await expect.element(screen.getByText("admin@example.com")).toBeInTheDocument();
		await expect
			.element(screen.getByRole("link", { name: "Units" }))
			.toHaveAttribute("href", "/units");
		await expect.element(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
	});

	it("hides the Units link from someone who can't view Units", async () => {
		const screen = await render(<AppHeader me={{ user, permissions: [] }} />);

		await expect.element(screen.getByRole("link", { name: "Tenora" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Units" }).elements()).toHaveLength(0);
	});
});
