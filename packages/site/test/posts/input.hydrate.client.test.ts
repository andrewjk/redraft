import { expect, test } from "vite-plus/test";
import { hydrate } from "@torpor/view";
import type PostEditModel from "../../src/types/posts/PostEditModel";
import PostInput from "../../src/views/posts/PostInput.torp?client";
import SsrPostInput from "../../src/views/posts/PostInput.torp?server";

const user = {
	url: "http://localhost/alice/",
	username: "alice",
	name: "Alice X",
	image: "alice.png",
};

function textArea() {
	return document.querySelector('textarea[name="text"]');
}

function parentButtons() {
	return [
		...document.querySelectorAll<HTMLElement>(".post-input-footer")[0]!.querySelectorAll("button"),
	].filter((b) => b.type === "button");
}

async function tick() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

async function hydratePostInput(post: PostEditModel) {
	document.body.innerHTML = "";
	const main = document.createElement("main");
	document.body.appendChild(main);
	const result = await SsrPostInput({ post, user, base: "/" });
	main.innerHTML = result.body;
	hydrate(main as unknown as ParentNode, PostInput, { post, user, base: "/" });
}

test("post input keeps the text box after toggling an article", async () => {
	await hydratePostInput({ id: 1, slug: "post", text: "Parent", children: [] });
	expect(textArea()).not.toBeNull();

	// Toggle the article button on, then off
	parentButtons()[3]!.click();
	await tick();
	expect(textArea()).not.toBeNull();
	expect(document.querySelector('textarea[name="articleText"]')).not.toBeNull();

	parentButtons()[3]!.click();
	await tick();
	expect(textArea()).not.toBeNull();
	expect(document.querySelector('textarea[name="articleText"]')).toBeNull();
});

test("post input keeps the text box after toggling an event", async () => {
	await hydratePostInput({ id: 1, slug: "post", text: "Parent", children: [] });
	expect(textArea()).not.toBeNull();

	// Toggle the event button on, then off
	parentButtons()[4]!.click();
	await tick();
	expect(textArea()).not.toBeNull();
	expect(document.querySelector('textarea[name="eventText"]')).not.toBeNull();

	parentButtons()[4]!.click();
	await tick();
	expect(textArea()).not.toBeNull();
	expect(document.querySelector('textarea[name="eventText"]')).toBeNull();
});
