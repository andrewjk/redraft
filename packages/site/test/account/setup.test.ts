import "@testing-library/jest-dom/vitest";
import { eq } from "drizzle-orm";
import fs from "node:fs";
import { afterAll, beforeAll, expect, test } from "vitest";
import { vi } from "vitest";
import * as schema from "../../src/data/schema/index";
import accountSetup, {
	type SetupModel,
	type SetupResponseModel,
} from "../../src/lib/account/accountSetup";
import testAdapter from "../testAdapter";

const adapter = testAdapter("./test/data/setup.db");

beforeAll(() => {
	// Copy the database here and create a social adapter that gets it
	fs.copyFileSync("./test/data/filled.db", "./test/data/setup.db");
	// @ts-ignore
	globalThis.socialAdapter = adapter;

	// Stub environment variables
	vi.stubEnv("JWT_SECRET", "blah");
	vi.stubEnv("SITE_LOCATION", "https://example.com/carla");
	vi.stubEnv("USERNAME", "carla");
	vi.stubEnv("PASSWORD", "carla's password");
});

afterAll(() => {
	fs.rmSync("./test/data/setup.db");
});

test("setup", async () => {
	const model: SetupModel = {
		username: "carla",
		password: "carla's password",
		name: "Carla Z",
		email: "carla@example.com",
		bio: "Carla's bio",
		image: "carla.png",
		location: "Carla's location",
	};
	const request = new Request("https://example.com", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await accountSetup(request);
	expect(response.status).toBe(201);

	const data = (await response.json()) as SetupResponseModel;

	expect(data.url).toEqual("https://example.com/carla");
	expect(data.username).toEqual("carla");
	expect(data.name).toEqual("Carla Z");
	expect(data.image).toEqual("carla.png");
	expect(data.token).not.toBeUndefined();
	expect(data.code).not.toBeUndefined();

	const db = adapter.database(schema);
	const user = await db.query.usersTable.findFirst({
		where: eq(schema.usersTable.username, "carla"),
	});

	expect(user).not.toBeUndefined();
	expect(user.name).toEqual("Carla Z");
	// etc
});
