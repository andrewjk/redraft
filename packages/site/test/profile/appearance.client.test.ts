import { expect, test } from "vite-plus/test";
import { mount } from "@torpor/view";
import AppearancePage from "../../src/views/profile/AppearancePage.torp?client";

async function tick() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

function mountPage(theme: Record<string, string> = {}, darkTheme: Record<string, string> = {}) {
	document.body.innerHTML = "";
	const main = document.createElement("main");
	document.body.appendChild(main);
	mount(main as unknown as ParentNode, AppearancePage, {
		data: {
			theme,
			darkTheme,
			viewing: { url: "http://localhost/", name: "Alice", image: "", bio: "", location: "" },
			user: { url: "http://localhost/", username: "alice", name: "Alice", image: "" },
			base: "/",
		},
	} as any);
}

function styles(): string {
	return [...document.querySelectorAll("style")].map((s) => s.textContent).join("\n");
}

test("appearance page seeds the light and dark forms from the current theme", async () => {
	mountPage({ background: "#112233" }, { background: "#445566" });

	const light = document.querySelector<HTMLInputElement>('input[name="light[background]"]')!;
	expect(light.value).toBe("#112233");

	const dark = document.querySelector<HTMLInputElement>('input[name="dark[background]"]')!;
	expect(dark.value).toBe("#445566");

	// Unset variables fall back to their defaults
	expect(document.querySelector<HTMLInputElement>('input[name="light[link]"]')!.value).toBe(
		"#0066cc",
	);
	expect(document.querySelector<HTMLInputElement>('input[name="dark[link]"]')!.value).toBe(
		"#86a8ff",
	);
});

test("appearance page live-previews edits in both modes", async () => {
	mountPage();

	expect(styles()).toContain(":root{");
	expect(styles()).toContain("--background:#fafbfc");

	const light = document.querySelector<HTMLInputElement>('input[name="light[background]"]')!;
	light.value = "#123456";
	light.dispatchEvent(new Event("input", { bubbles: true }));

	const dark = document.querySelector<HTMLInputElement>('input[name="dark[background]"]')!;
	dark.value = "#abcdef";
	dark.dispatchEvent(new Event("input", { bubbles: true }));
	await tick();

	expect(styles()).toContain("html.dark{");
	expect(styles()).toContain("--background:#123456");
	expect(styles()).toContain("--background:#abcdef");
});
