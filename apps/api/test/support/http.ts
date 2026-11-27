import request from "supertest";

/** Signs in over HTTP and returns the `Cookie` header value for later requests. */
export async function signInCookie(
	server: Parameters<typeof request>[0],
	email: string,
	password: string,
): Promise<string> {
	const response = await request(server).post("/api/auth/sign-in/email").send({ email, password });
	if (response.status !== 200) {
		throw new Error(`Sign-in as ${email} failed with ${response.status}`);
	}
	return (response.headers["set-cookie"] as unknown as string[])
		.map((cookie) => cookie.split(";")[0])
		.join("; ");
}
