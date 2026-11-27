import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";
import { Button } from "./button";

describe("Button", () => {
	it("renders its children as a button", async () => {
		const screen = await render(<Button>Save</Button>);
		await expect.element(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
	});

	it("applies the default variant and size", async () => {
		const screen = await render(<Button>Save</Button>);
		const button = screen.getByRole("button");
		await expect.element(button).toHaveAttribute("data-variant", "default");
		await expect.element(button).toHaveAttribute("data-size", "default");
	});

	it("applies a custom variant, size and className", async () => {
		const screen = await render(
			<Button variant="destructive" size="lg" className="custom">
				Delete
			</Button>,
		);
		const button = screen.getByRole("button");
		await expect.element(button).toHaveAttribute("data-variant", "destructive");
		await expect.element(button).toHaveAttribute("data-size", "lg");
		await expect.element(button).toHaveClass("custom");
	});

	it("calls onClick when clicked", async () => {
		const onClick = vi.fn();
		const screen = await render(<Button onClick={onClick}>Go</Button>);
		await screen.getByRole("button").click();
		expect(onClick).toHaveBeenCalledOnce();
	});

	it("does not call onClick when disabled", async () => {
		const onClick = vi.fn();
		const screen = await render(
			<Button disabled onClick={onClick}>
				Go
			</Button>,
		);
		await screen.getByRole("button").click({ force: true });
		expect(onClick).not.toHaveBeenCalled();
	});

	it("renders the child element instead of a button with asChild", async () => {
		const screen = await render(
			<Button asChild>
				<a href="/home">Home</a>
			</Button>,
		);
		await expect.element(screen.getByRole("button")).not.toBeInTheDocument();
		await expect
			.element(screen.getByRole("link", { name: "Home" }))
			.toHaveAttribute("href", "/home");
	});
});
