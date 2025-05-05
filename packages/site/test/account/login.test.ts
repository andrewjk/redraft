import "@testing-library/jest-dom/vitest";
import fs from "node:fs";
import { afterAll, beforeAll, expect, test } from "vitest";
import { vi } from "vitest";
import accountLogin, {
	type LoginModel,
	type LoginResponseModel,
} from "../../src/lib/account/accountLogin";
import testAdapter from "../testAdapter";

beforeAll(() => {
	// Copy the database here and create a social adapter that gets it
	fs.copyFileSync("./test/data/filled.db", "./test/data/login.db");
	// @ts-ignore
	globalThis.socialAdapter = testAdapter("./test/data/login.db");

	// Stub environment variables
	vi.stubEnv("JWT_SECRET", "blah");
});

afterAll(() => {
	fs.rmSync("./test/data/login.db");
});

test("login", async () => {
	const model: LoginModel = {
		email: "alice@example.com",
		password: "alice's password",
		rememberMe: true,
	};
	const request = new Request("https://example.com", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await accountLogin(request);
	expect(response.status).toBe(200);

	const data = (await response.json()) as LoginResponseModel;

	expect(data.url).toEqual("https://example.com/alice");
	expect(data.username).toEqual("alice");
	expect(data.name).toEqual("Alice X");
	expect(data.image).toEqual("alice.png");
	expect(data.token).not.toBeUndefined();
	expect(data.code).not.toBeUndefined();
});
