import { queryByText } from "@testing-library/dom";
import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { runTest } from "@torpor/build/test";
import { afterAll, beforeAll, expect, test } from "vitest";
import accountLogin, {
	type LoginModel,
	type LoginResponseModel,
} from "../../src/lib/account/accountLogin";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

const site: Site = new Site();

beforeAll(async () => {
	await prepareSiteTest(site, "login");
});

afterAll(() => {
	cleanUpSiteTest("login");
});

test("login get", async () => {
	const response = await runTest(site, "/account/login");
	const html = await response.text();

	const div = document.createElement("div");
	div.innerHTML = html;

	const title = queryByText(div, "Remember me");
	expect(title).not.toBeNull();
});

test("login post", async () => {
	const model: LoginModel = {
		email: "alice@localhost",
		password: "alice's password",
		rememberMe: true,
	};
	const request = new Request("http://localhost", {
		method: "POST",
		body: JSON.stringify(model),
	});
	const response = await accountLogin(request);
	expect(response.status).toBe(200);

	const data = (await response.json()) as LoginResponseModel;

	expect(data.url).toEqual("http://localhost/alice/");
	expect(data.username).toEqual("alice");
	expect(data.name).toEqual("Alice X");
	expect(data.image).toEqual("alice.png");
	expect(data.token).not.toBeUndefined();
	expect(data.code).not.toBeUndefined();
});
