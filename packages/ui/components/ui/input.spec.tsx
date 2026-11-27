import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { Input } from "./input";

describe("Input", () => {
	it("renders a text box that can be typed into", async () => {
		const screen = await render(<Input aria-label="Name" />);
		const input = screen.getByRole("textbox", { name: "Name" });
		await input.fill("Flat 4");
		await expect.element(input).toHaveValue("Flat 4");
	});

	it("passes the type, className and disabled through", async () => {
		const screen = await render(
			<Input aria-label="Secret" type="password" className="custom" disabled />,
		);
		const input = screen.getByLabelText("Secret");
		await expect.element(input).toHaveAttribute("type", "password");
		await expect.element(input).toHaveClass("custom");
		await expect.element(input).toBeDisabled();
	});
});
