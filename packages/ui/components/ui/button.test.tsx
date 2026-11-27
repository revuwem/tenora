import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button", () => {
	it("renders its children as a button", () => {
		render(<Button>Save</Button>);
		expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
	});

	it("applies the default variant and size", () => {
		render(<Button>Save</Button>);
		const button = screen.getByRole("button");
		expect(button).toHaveAttribute("data-variant", "default");
		expect(button).toHaveAttribute("data-size", "default");
	});

	it("applies a custom variant, size and className", () => {
		render(
			<Button variant="destructive" size="lg" className="custom">
				Delete
			</Button>,
		);
		const button = screen.getByRole("button");
		expect(button).toHaveAttribute("data-variant", "destructive");
		expect(button).toHaveAttribute("data-size", "lg");
		expect(button).toHaveClass("custom");
	});

	it("calls onClick when clicked", async () => {
		const onClick = vi.fn();
		render(<Button onClick={onClick}>Go</Button>);
		await userEvent.click(screen.getByRole("button"));
		expect(onClick).toHaveBeenCalledOnce();
	});

	it("does not call onClick when disabled", async () => {
		const onClick = vi.fn();
		render(
			<Button disabled onClick={onClick}>
				Go
			</Button>,
		);
		await userEvent.click(screen.getByRole("button"));
		expect(onClick).not.toHaveBeenCalled();
	});

	it("renders the child element instead of a button with asChild", () => {
		render(
			<Button asChild>
				<a href="/home">Home</a>
			</Button>,
		);
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/home");
	});
});
