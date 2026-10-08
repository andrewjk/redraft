import { expect, test } from "vite-plus/test";
import { mount } from "@torpor/view";
import Layout from "../src/views/Layout.torp";

async function tick() {
	await new Promise((r) => setTimeout(r, 0));
}

const data = {
	user: {
		url: "/",
		username: "alice",
		name: "Alice",
		image: "",
		notificationCount: 0,
		messageCount: 0,
	},
	follower: null,
	viewing: { url: "http://localhost/", name: "Alice", image: "", bio: "", location: "" },
	base: "/",
};

test("header theme toggle toggles the theme", async () => {
	document.body.innerHTML = "";
	document.documentElement.classList.remove("dark");
	localStorage.removeItem("redraft-theme");
	const main = document.createElement("main");
	document.body.appendChild(main);
	mount(main as unknown as ParentNode, Layout, { data } as any);
	await tick();

	const items = [...document.querySelectorAll(".theme-item")];
	console.log(
		"theme items:",
		items.length,
		items.map((i) => i.getAttribute("data-state")),
	);
	expect(items.length).toBe(2);

	// Click "dark" (the second item) and check the class + storage
	(items[1] as HTMLButtonElement).click();
	await tick();
	console.log("has dark class:", document.documentElement.classList.contains("dark"));
	console.log("stored:", localStorage.getItem("redraft-theme"));
	expect(document.documentElement.classList.contains("dark")).toBe(true);
	expect(localStorage.getItem("redraft-theme")).toBe("dark");

	// The rest of the app must still be there
	console.log(
		"after dark -> app-layout:",
		!!document.querySelector(".app-layout"),
		"nav:",
		!!document.querySelector(".nav-bar"),
		"items:",
		document.querySelectorAll(".theme-item").length,
	);
	expect(document.querySelector(".app-layout")).not.toBeNull();
	expect(document.querySelector(".nav-bar")).not.toBeNull();

	// And back to light
	const items2 = [...document.querySelectorAll(".theme-item")];
	(items2[0] as HTMLButtonElement).click();
	await tick();
	expect(document.querySelector(".app-layout")).not.toBeNull();
	expect(document.documentElement.classList.contains("dark")).toBe(false);
});
