/** Reads a required environment variable, failing loudly when it is missing or empty. */
export function requireEnv(name: string): string {
	const value = process.env[name];
	if (!value) {
		throw new Error(`${name} is not set`);
	}
	return value;
}
