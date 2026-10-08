import "@testing-library/jest-dom/vitest";
import { Site } from "@torpor/build";
import { runTest } from "@torpor/build/test";
import { afterAll, beforeAll, expect, test } from "vite-plus/test";
import { eq } from "drizzle-orm";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "../../src/data/schema/index";
import buildTestEvent from "../buildTestEvent";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

const site: Site = new Site();
let db: LibSQLDatabase<typeof schema>;

beforeAll(async () => {
	db = await prepareSiteTest(site, "posts-publish-form");
});

afterAll(() => {
	cleanUpSiteTest("posts-publish-form");
});

// Submits the form data exactly like the browser does when the publish
// button is pressed: all the hidden fields are set, and text is filled in
test("post publish form submit", async () => {
	const postCount = await db.$count(schema.postsTable);

	const ev = await buildTestEvent("http://localhost/posts/compose?/publishPost", "xxx-alice");
	ev.request = new Request("http://localhost/posts/compose?/publishPost", {
		method: "POST",
		body: buildPublishForm(),
	});

	const response = await runTest(site, "/posts/compose", ev);
	expect(response.status).toBe(303);
	expect(response.headers.get("location")).toBe("/posts");

	const post = await db.query.postsTable.findFirst({
		where: eq(schema.postsTable.text, "This is a new post"),
	});
	expect(post).not.toBeUndefined();
	expect(await db.$count(schema.postsTable)).toBe(postCount + 1);
});

// NOTE: The same submit currently fails client-side (before the request is
// ever sent): @torpor/ui's TextArea/Input register their own `oninput`
// handler after the `&value` binding write, and delegated events are
// last-write-wins per element per type, so typing never updates the form
// state and `Form.validate()` sees empty text. Recorded in the torpor
// repo's FOLLOWUP.md; this test pins the server side of the flow.
function buildPublishForm() {
	const form = new FormData();
	form.set("id", "-1");
	form.set("published", "");
	form.set("hasImage", "");
	form.set("hasLink", "");
	form.set("hasRating", "");
	form.set("isArticle", "");
	form.set("isEvent", "");
	form.set("text", "This is a new post");
	return form;
}
