import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

import { SignOutButton } from "./sign-out-button";

describe("SignOutButton", () => {
	const fetchMock = vi.fn();

	beforeEach(() => {
		fetchMock.mockReset();
		router.push.mockReset();
		router.refresh.mockReset();
		vi.stubGlobal("fetch", fetchMock);
	});

	it("signs out through the web app's own /api and goes to the sign-in page", async () => {
		fetchMock.mockResolvedValue(Response.json({}));
		const screen = await render(<SignOutButton />);

		await screen.getByRole("button", { name: "Sign out" }).click();

		await vi.waitFor(() => expect(router.push).toHaveBeenCalledWith("/sign-in"));
		expect(fetchMock).toHaveBeenCalledWith(
			"/api/auth/sign-out",
			expect.objectContaining({ method: "POST" }),
		);
	});

	it("stays where it is when the server can't be reached", async () => {
		fetchMock.mockRejectedValue(new TypeError("network down"));
		const screen = await render(<SignOutButton />);

		await screen.getByRole("button", { name: "Sign out" }).click();

		await expect.element(screen.getByRole("button", { name: "Sign out" })).toBeEnabled();
		expect(router.push).not.toHaveBeenCalled();
	});
});
