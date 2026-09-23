import { expect, test } from "vite-plus/test";
import { mount } from "@torpor/view";
import * as v from "valibot";
import formDataToObject from "../../src/lib/utils/formDataToObject";
import type UserModel from "../../src/types/UserModel";
import type PostEditModel from "../../src/types/posts/PostEditModel";
import PostEditSchema from "../../src/types/posts/PostEditSchema";
import PostInput from "../../src/views/posts/PostInput.torp?client";

const user: UserModel = {
	url: "http://localhost/alice/",
	username: "alice",
	name: "Alice X",
	image: "alice.png",
};

// The ids of the child posts, by their position in the submitted form data
function childIds() {
	const ids: (string | null)[] = [];
	for (let input of document.querySelectorAll<HTMLInputElement>('input[name^="children"]')) {
		const match = input.name.match(/^children\[(\d+)\]id$/);
		if (match) ids[+match[1]] = input.value;
	}
	return ids;
}

function footerButtonFooters() {
	// Each PostInputFields renders a footer with tool buttons, and (for the
	// parent or the last child) a footer with submit buttons
	return [...document.querySelectorAll<HTMLElement>(".post-input-footer")].filter((f) =>
		[...f.querySelectorAll("button")].every((b) => b.type === "button"),
	);
}

// The tool footer of a child contains: image, link, rating, move up, move
// down, remove, add. childIndex -1 is the parent post's footer
function footerButtons(childIndex: number) {
	return [...footerButtonFooters()[childIndex + 1]!.querySelectorAll("button")];
}

function upButton(childIndex: number) {
	return footerButtons(childIndex)[3]!;
}

function downButton(childIndex: number) {
	return footerButtons(childIndex)[4]!;
}

function removeButton(childIndex: number) {
	return footerButtons(childIndex)[5]!;
}

function addButton(childIndex: number) {
	const buttons = footerButtons(childIndex);
	// The parent footer has tags and visibility buttons after add, the child
	// footer doesn't
	return childIndex === -1 ? buttons[5]! : buttons[buttons.length - 1]!;
}

async function tick() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

function mountPostInput(post: PostEditModel) {
	document.body.innerHTML = "";
	const main = document.createElement("main");
	document.body.appendChild(main);
	// happy-dom's HTMLElement doesn't match the DOM lib's ParentNode type
	mount(main as unknown as ParentNode, PostInput, { post, user, base: "/" });
}

test("post input removes a child post", async () => {
	mountPostInput({
		id: 1,
		slug: "post",
		text: "Parent",
		children: [
			{ id: 101, slug: "c1", text: "Child one" },
			{ id: 102, slug: "c2", text: "Child two" },
		],
	});
	expect(childIds()).toEqual(["101", "102"]);

	removeButton(0).click();
	await tick();

	// The second child moves up, and its form field names are updated
	expect(childIds()).toEqual(["102"]);
	expect(document.querySelector<HTMLInputElement>('input[name="children[0]id"]')!.value).toBe(
		"102",
	);
	expect(document.querySelector('input[name="children[1]id"]')).toBeNull();
});

test("post input removes the last child post", async () => {
	mountPostInput({
		id: 1,
		slug: "post",
		text: "Parent",
		children: [{ id: 101, slug: "c1", text: "Child one" }],
	});
	expect(childIds()).toEqual(["101"]);

	removeButton(0).click();
	await tick();

	expect(childIds()).toEqual([]);
	expect(document.querySelector('input[name^="children"]')).toBeNull();
});

// Submits the form like the browser would, and builds the model the save
// action builds from it
function submitModel(): PostEditModel {
	const form = document.querySelector("form")!;
	return formDataToObject(new FormData(form) as any) as PostEditModel;
}

function expectValidModel(model: PostEditModel) {
	const validated = v.safeParse(PostEditSchema, model);
	const messages = validated.success ? [] : validated.issues.map((i) => i.message);
	expect(messages).toEqual([]);
}

test("post input submits a valid model after removing the last child", async () => {
	mountPostInput({
		id: 1,
		slug: "post",
		text: "Parent",
		children: [
			{ id: 101, slug: "c1", text: "Child one" },
			{ id: 102, slug: "c2", text: "Child two" },
		],
	});

	removeButton(1).click();
	await tick();

	expect(childIds()).toEqual(["101"]);
	expectValidModel(submitModel());
});

test("post input submits a valid model after removing a middle child", async () => {
	mountPostInput({
		id: 1,
		slug: "post",
		text: "Parent",
		children: [
			{ id: 101, slug: "c1", text: "Child one" },
			{ id: 102, slug: "c2", text: "Child two" },
			{ id: 103, slug: "c3", text: "Child three" },
		],
	});

	removeButton(1).click();
	await tick();

	expect(childIds()).toEqual(["101", "103"]);
	expectValidModel(submitModel());
});

test("post input keeps child field names correct after adding children", async () => {
	mountPostInput({
		id: 1,
		slug: "post",
		text: "Parent",
		children: [{ id: 101, slug: "c1", text: "Child one" }],
	});
	expect(childIds()).toEqual(["101"]);

	// Add from the parent footer (inserts at the start), then from the first
	// child footer (inserts after it)
	addButton(-1).click();
	await tick();
	addButton(0).click();
	await tick();

	// All ids unique, and each child's fields match its array position
	expect(childIds()).toEqual(["-1", "-2", "101"]);
});

test("post input moves a child post up and down", async () => {
	mountPostInput({
		id: 1,
		slug: "post",
		text: "Parent",
		children: [
			{ id: 101, slug: "c1", text: "Child one" },
			{ id: 102, slug: "c2", text: "Child two" },
			{ id: 103, slug: "c3", text: "Child three" },
		],
	});
	expect(childIds()).toEqual(["101", "102", "103"]);

	// The end children are fenced in
	expect(upButton(0).disabled).toBe(true);
	expect(downButton(2).disabled).toBe(true);
	expect(downButton(0).disabled).toBe(false);

	// Move the first child down
	downButton(0).click();
	await tick();
	expect(childIds()).toEqual(["102", "101", "103"]);
	expectValidModel(submitModel());

	// Move the last child up
	upButton(2).click();
	await tick();
	expect(childIds()).toEqual(["102", "103", "101"]);
	expectValidModel(submitModel());

	// The end children are fenced in again
	expect(upButton(0).disabled).toBe(true);
	expect(downButton(2).disabled).toBe(true);
});
