import { expect, test } from "vite-plus/test";
import type UserModel from "../../src/types/UserModel";
import type PostEditModel from "../../src/types/posts/PostEditModel";
import PostInput from "../../src/views/posts/PostInput.torp";

const user: UserModel = {
	url: "http://localhost/alice/",
	username: "alice",
	name: "Alice X",
	image: "alice.png",
};

function renderPostInput(post: PostEditModel, formData?: Record<string, any>) {
	return PostInput({
		post,
		user,
		base: "/",
		form: formData ? { message: "Text is required", data: formData } : undefined,
	});
}

// NOTE: happy-dom drops the `value` attribute when it parses a <textarea>,
// so these tests assert against the raw SSR markup instead of the parsed DOM

test("post input shows new post", async () => {
	const result = await renderPostInput({
		id: -1,
		slug: "",
		text: "",
		children: [],
	});

	const textarea = result.body.match(/<textarea[^>]*name="text"[^>]*>/);
	expect(textarea).not.toBeNull();
	expect(textarea![0]).toContain('placeholder="Post something…"');
	expect(textarea![0]).toContain('value=""');
});

test("post input keeps typed text after an error", async () => {
	const result = await renderPostInput(
		{ id: -1, slug: "", text: "", children: [] },
		{
			id: -1,
			text: "My unsaved post",
			tags: "tag1;tag2",
			visibility: 1,
			children: [],
		},
	);

	expect(result.body).toMatch(/<textarea[^>]*name="text" value="My unsaved post"/);
	expect(result.body).toMatch(/<input[^>]*name="tags" value="tag1;tag2"/);
});

test("post input keeps child posts after an error", async () => {
	const result = await renderPostInput(
		{ id: -1, slug: "", text: "", children: [] },
		{
			id: -1,
			text: "My unsaved post",
			children: [{ id: -1, text: "My unsaved child" }],
		},
	);

	expect(result.body).toMatch(/<textarea[^>]*name="text" value="My unsaved post"/);
	expect(result.body).toMatch(/<textarea[^>]*name="children\[0\]text" value="My unsaved child"/);
});

test("post input keeps a link image after an error", async () => {
	const result = await renderPostInput(
		{ id: -1, slug: "", text: "", children: [] },
		{
			id: -1,
			isArticle: true,
			linkTitle: "My article",
			linkImage: "http://localhost/api/content/abc.png",
			articleText: "My article text",
		},
	);

	expect(result.body).toMatch(
		/<input[^>]*type="hidden"[^>]*name="linkImage" value="http:\/\/localhost\/api\/content\/abc\.png"/,
	);
	expect(result.body).toMatch(/<img[^>]*src="http:\/\/localhost\/api\/content\/abc\.png"/);
});
