import { Site } from "@torpor/build";
import { desc } from "drizzle-orm";
import { LibSQLDatabase } from "drizzle-orm/libsql";
import { afterAll, beforeAll, expect, test } from "vite-plus/test";
import * as schema from "../../src/data/schema/index";
import createUserToken from "../../src/lib/utils/createUserToken";
import savePost from "../../src/routes/posts/_actions/savePost";
import { cleanUpSiteTest, prepareSiteTest } from "../prepareSiteTest";

const site: Site = new Site();
let db: LibSQLDatabase<typeof schema>;
let token: string;

beforeAll(async () => {
	db = await prepareSiteTest(site, "post-file");
	token = await createUserToken(
		{ url: "http://localhost/", username: "alice", name: "Alice X" },
		"xxx-alice",
	);
});

afterAll(() => {
	cleanUpSiteTest("post-file");
});

function action(user: Record<string, any>, form: FormData) {
	const request = new Request("http://localhost", { method: "POST", body: form });
	return savePost({ appData: { user }, request, params: {} } as any);
}

test("saving a post with a file stores a download url and keeps the filename", async () => {
	const form = new FormData();
	form.set("id", "-1");
	form.set("text", "");
	form.set("hasImage", "true");
	form.set("isFile", "true");
	form.set(
		"imagefile",
		new File(["quarterly numbers"], "Quarterly Report.pdf", {
			type: "application/pdf",
		}),
	);

	const response = await action({ url: "http://localhost/", code: "xxx-alice", token }, form);
	expect(response.status).toBe(303);

	const post = await db.query.postsTable.findFirst({
		orderBy: [desc(schema.postsTable.id)],
	});
	expect(post!.image).toMatch(/\/api\/content\/file-QuarterlyReport-[0-9a-f]{8}\.pdf$/);
	// Files reuse image_alt_text for the original filename (for display/download)
	expect(post!.image_alt_text).toBe("Quarterly Report.pdf");
});

test("saving a disallowed file type is rejected", async () => {
	const form = new FormData();
	form.set("id", "-1");
	form.set("text", "");
	form.set("hasImage", "true");
	form.set("isFile", "true");
	form.set("imagefile", new File(["MZ"], "setup.exe", { type: "application/x-msdownload" }));

	const response = await action({ url: "http://localhost/", code: "xxx-alice", token }, form);
	expect(response.status).toBe(400);
});

test("saving a post with an oversized file is rejected", async () => {
	const form = new FormData();
	form.set("id", "-1");
	form.set("text", "");
	form.set("hasImage", "true");
	form.set("isFile", "true");
	// The default limit is 10 MB
	form.set(
		"imagefile",
		new File([new Uint8Array(11 * 1024 * 1024)], "big.pdf", {
			type: "application/pdf",
		}),
	);

	const response = await action({ url: "http://localhost/", code: "xxx-alice", token }, form);
	expect(response.status).toBe(400);
});

test("the upload size limit can be raised with MAX_UPLOAD_SIZE", async () => {
	const previous = process.env.MAX_UPLOAD_SIZE;
	process.env.MAX_UPLOAD_SIZE = "50";
	try {
		const form = new FormData();
		form.set("id", "-1");
		form.set("text", "");
		form.set("hasImage", "true");
		form.set("isFile", "true");
		form.set(
			"imagefile",
			new File([new Uint8Array(11 * 1024 * 1024)], "big.pdf", {
				type: "application/pdf",
			}),
		);

		const response = await action({ url: "http://localhost/", code: "xxx-alice", token }, form);
		expect(response.status).toBe(303);
	} finally {
		if (previous === undefined) {
			delete process.env.MAX_UPLOAD_SIZE;
		} else {
			process.env.MAX_UPLOAD_SIZE = previous;
		}
	}
});

test("saving an image keeps the upload behaviour and the alt text", async () => {
	const form = new FormData();
	form.set("id", "-1");
	form.set("text", "");
	form.set("hasImage", "true");
	form.set("isFile", "false");
	form.set("imageAltText", "A picture");
	form.set("imagefile", new File(["png bytes"], "photo.png", { type: "image/png" }));

	const response = await action({ url: "http://localhost/", code: "xxx-alice", token }, form);
	expect(response.status).toBe(303);

	const post = await db.query.postsTable.findFirst({
		orderBy: [desc(schema.postsTable.id)],
	});
	expect(post!.image).toMatch(/\/api\/content\/[0-9a-f-]+\.png$/);
	expect(post!.image_alt_text).toBe("A picture");
});
