import { execFileSync, spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { join } from "node:path";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Client, Pool } from "pg";

// Integration tests run against a real Postgres, in a database of their own.
//
//  - TEST_DATABASE_URL set (CI): connect to that server.
//  - Otherwise: start a throwaway postgres container on a free local port, so nothing needs
//    publishing from the dev stack and parallel worktrees don't collide. Needs Docker.
//
// Either way this creates `tenora_test_<random>`, migrates it, points DATABASE_URL at it, and
// drops it afterwards. Test files add their own data with unique values, so they never clash.

const docker = (...args: string[]) => execFileSync("docker", args, { encoding: "utf8" }).trim();

// Postgres logs to stderr, which `docker logs` passes through.
const dockerLogs = (id: string) => {
	const { stdout, stderr } = spawnSync("docker", ["logs", id], { encoding: "utf8" });
	return stdout + stderr;
};

let containerId: string | undefined;
let serverUrl: string;
const databaseName = `tenora_test_${randomBytes(4).toString("hex")}`;

function withDatabase(url: string, database: string) {
	const parsed = new URL(url);
	parsed.pathname = `/${database}`;
	return parsed.toString();
}

async function canConnect(url: string) {
	const client = new Client({ connectionString: url });
	try {
		await client.connect();
		await client.query("select 1");
		return true;
	} catch {
		return false;
	} finally {
		await client.end().catch(() => {});
	}
}

async function startContainer() {
	try {
		containerId = docker(
			"run",
			"-d",
			"--rm",
			"-e",
			"POSTGRES_PASSWORD=test",
			"-p",
			"127.0.0.1::5432",
			"postgres:17-alpine",
		);
	} catch (error) {
		throw new Error(
			"Integration tests need a Postgres. Set TEST_DATABASE_URL to a server you can create " +
				`databases on, or start Docker.\n${String(error)}`,
		);
	}
	const port = docker("port", containerId, "5432/tcp").split(":").pop();
	const url = `postgres://postgres:test@127.0.0.1:${port}/postgres`;
	// The image starts a temporary server for its init scripts, then restarts: wait for the
	// second "ready" line.
	for (let attempt = 0; attempt < 60; attempt++) {
		const ready = dockerLogs(containerId).split("ready to accept connections").length - 1;
		if (ready >= 2 && (await canConnect(url))) return url;
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	docker("stop", containerId);
	throw new Error("The test Postgres container did not become ready in 30 seconds");
}

export async function setup() {
	serverUrl = process.env.TEST_DATABASE_URL ?? (await startContainer());

	const admin = new Client({ connectionString: serverUrl });
	await admin.connect();
	await admin.query(`create database "${databaseName}"`);
	await admin.end();

	const databaseUrl = withDatabase(serverUrl, databaseName);
	const pool = new Pool({ connectionString: databaseUrl });
	await migrate(drizzle(pool), { migrationsFolder: join(__dirname, "../../drizzle") });
	await pool.end();

	process.env.DATABASE_URL = databaseUrl;
}

export async function teardown() {
	if (containerId) {
		docker("stop", containerId);
		return;
	}
	const admin = new Client({ connectionString: serverUrl });
	await admin.connect();
	await admin.query(`drop database if exists "${databaseName}" with (force)`);
	await admin.end();
}
