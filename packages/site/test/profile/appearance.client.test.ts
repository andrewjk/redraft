import { expect, test } from "vite-plus/test";
import { mount } from "@torpor/view";
import AppearancePage from "../../src/views/profile/AppearancePage.torp?client";

async function tick() {
	await new Promise((resolve) => setTimeout(resolve, 0));
}

function mountPage(theme: Record<string, string> = {}) {
	document.body.innerHTML = "";
	const main = document.createElement("main");
	document.body.appendChild(main);
	mount(main as unknown as ParentNode, AppearancePage, {
		data: {
			theme,
			viewing: { url: "http://localhost/", name: "Alice", image: "", bio: "", location: "" },
			user: { url: "http://localhost/", username: "alice", name: "Alice", image: "" },
			base: "/",
		},
	} as any);
}

test("appearance page seeds the form from the current theme", async () => {
	mountPage({ background: "#112233" });

	const background = document.querySelector<HTMLInputElement>('input[name="background"]')!;
	expect(background.value).toBe("#112233");

	// Unset variables fall back to their defaults
	const link = document.querySelector<HTMLInputElement>('input[name="link"]')!;
	expect(link.value).toBe("#0066cc");
});

test("appearance page live-previews edits", async () => {
	mountPage();

	expect(document.querySelector("style")!.textContent).toContain("--background:#fafbfc");

	const background = document.querySelector<HTMLInputElement>('input[name="background"]')!;
	background.value = "#123456";
	background.dispatchEvent(new Event("input", { bubbles: true }));
	await tick();

	expect(document.querySelector("style")!.textContent).toContain("--background:#123456");
});
