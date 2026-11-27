import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import { UnitsList } from "./units-list";

describe("UnitsList", () => {
	it("says there are no Units yet", async () => {
		const screen = await render(<UnitsList units={[]} />);
		await expect.element(screen.getByText("No Units yet.")).toBeInTheDocument();
	});

	it("lists each Unit with its address and building", async () => {
		const screen = await render(
			<UnitsList
				units={[
					{ id: "1", name: "Flat 4", address: "12 Rustaveli Ave", buildingLabel: "Block B" },
					{ id: "2", name: "Flat 5", address: "14 Rustaveli Ave", buildingLabel: null },
				]}
			/>,
		);

		await expect
			.element(screen.getByRole("row", { name: /Flat 4.*12 Rustaveli Ave.*Block B/ }))
			.toBeInTheDocument();
		await expect
			.element(screen.getByRole("row", { name: /Flat 5.*14 Rustaveli Ave.*—/ }))
			.toBeInTheDocument();
	});
});
