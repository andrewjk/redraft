import { browser } from "wxt/browser";
import { get } from "./api";

// TODO: Refresh this when it changes

export default async function loadProfile(): Promise<void> {
	const { url, token } = await browser.storage.local.get();
	const profile = await get(url, `api/extension/profile`, token);
	if (profile) {
		await browser.storage.local.set({ profile });
	}

	// TODO: Handle errors
}
