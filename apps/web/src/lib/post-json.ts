/** POSTs JSON to the web app's own /api (the browser never talks to the api directly). */
export function postJson(path: string, body: unknown): Promise<Response> {
	return fetch(path, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify(body),
	});
}
