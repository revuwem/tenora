import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

import { CreateUnitForm } from "./create-unit-form";

describe("CreateUnitForm", () => {
	const fetchMock = vi.fn();

	beforeEach(() => {
		fetchMock.mockReset();
		router.refresh.mockReset();
		vi.stubGlobal("fetch", fetchMock);
	});

	it("creates a Unit, clears the form and refreshes the list", async () => {
		fetchMock.mockResolvedValue(Response.json({}, { status: 201 }));
		const screen = await render(<CreateUnitForm />);

		await screen.getByLabelText("Name").fill("Flat 4");
		await screen.getByLabelText("Address").fill("12 Rustaveli Ave");
		await screen.getByLabelText("Building (optional)").fill("Block B");
		await screen.getByRole("button", { name: "Add Unit" }).click();

		await vi.waitFor(() => expect(router.refresh).toHaveBeenCalled());
		expect(fetchMock).toHaveBeenCalledWith("/api/units", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				name: "Flat 4",
				address: "12 Rustaveli Ave",
				buildingLabel: "Block B",
			}),
		});
		await expect.element(screen.getByLabelText("Name")).toHaveValue("");
	});

	it("leaves the building out when it is blank", async () => {
		fetchMock.mockResolvedValue(Response.json({}, { status: 201 }));
		const screen = await render(<CreateUnitForm />);

		await screen.getByLabelText("Name").fill("Flat 4");
		await screen.getByLabelText("Address").fill("12 Rustaveli Ave");
		await screen.getByRole("button", { name: "Add Unit" }).click();

		await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
		expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
			name: "Flat 4",
			address: "12 Rustaveli Ave",
		});
	});

	it("asks for a name and an address before calling the api", async () => {
		const screen = await render(<CreateUnitForm />);

		await screen.getByLabelText("Name").fill("Flat 4");
		await screen.getByRole("button", { name: "Add Unit" }).click();

		await expect.element(screen.getByRole("alert")).toHaveTextContent("A Unit needs an address.");
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("says so when the api refuses, keeping what was typed", async () => {
		fetchMock.mockResolvedValue(new Response(null, { status: 403 }));
		const screen = await render(<CreateUnitForm />);

		await screen.getByLabelText("Name").fill("Flat 4");
		await screen.getByLabelText("Address").fill("12 Rustaveli Ave");
		await screen.getByRole("button", { name: "Add Unit" }).click();

		await expect
			.element(screen.getByRole("alert"))
			.toHaveTextContent("The Unit could not be created. Try again.");
		await expect.element(screen.getByLabelText("Name")).toHaveValue("Flat 4");
		expect(router.refresh).not.toHaveBeenCalled();
	});
});
