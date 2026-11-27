import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

const router = vi.hoisted(() => ({ push: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

import { SignInForm } from "./sign-in-form";

describe("SignInForm", () => {
	const fetchMock = vi.fn();

	beforeEach(() => {
		fetchMock.mockReset();
		router.push.mockReset();
		router.refresh.mockReset();
		vi.stubGlobal("fetch", fetchMock);
	});

	async function submit(screen: Awaited<ReturnType<typeof render>>) {
		await screen.getByLabelText("Email").fill("admin@example.com");
		await screen.getByLabelText("Password").fill("a-password");
		await screen.getByRole("button", { name: "Sign in" }).click();
	}

	it("signs in through the web app's own /api and goes to the main page", async () => {
		fetchMock.mockResolvedValue(Response.json({}));
		const screen = await render(<SignInForm />);

		await submit(screen);

		await vi.waitFor(() => expect(router.push).toHaveBeenCalledWith("/"));
		expect(fetchMock).toHaveBeenCalledWith("/api/auth/sign-in/email", {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ email: "admin@example.com", password: "a-password" }),
		});
		expect(router.refresh).toHaveBeenCalled();
	});

	it("says so when the email or password is wrong, and stays on the page", async () => {
		fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
		const screen = await render(<SignInForm />);

		await submit(screen);

		await expect.element(screen.getByRole("alert")).toHaveTextContent("Wrong email or password.");
		expect(router.push).not.toHaveBeenCalled();
	});

	it("says so when the server can't be reached", async () => {
		fetchMock.mockRejectedValue(new TypeError("network down"));
		const screen = await render(<SignInForm />);

		await submit(screen);

		await expect
			.element(screen.getByRole("alert"))
			.toHaveTextContent("Could not reach the server. Try again.");
	});
});
