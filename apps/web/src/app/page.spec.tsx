import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import Home from "./page";

describe("Home page", () => {
	it("renders the heading", async () => {
		const screen = await render(<Home />);
		await expect
			.element(screen.getByRole("heading", { level: 1, name: "Hello, world!" }))
			.toBeInTheDocument();
	});

	it("renders a disabled call-to-action button", async () => {
		const screen = await render(<Home />);
		await expect.element(screen.getByRole("button", { name: "Get started" })).toBeDisabled();
	});
});
