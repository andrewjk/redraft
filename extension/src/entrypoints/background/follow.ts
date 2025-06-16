import { browser } from "wxt/browser";
import type { MessageResponse } from "../../types/Message";
import { post } from "./api";

export async function follow(): Promise<MessageResponse> {
	let { url, token, followUrl } = await browser.storage.local.get();
	if (!followUrl) {
		return { ok: false, error: "No follow url supplied" };
	}

	// TODO:
	let ok = true;

	// Send them to the url to follow
	if (!url.endsWith("/")) url += "/";
	await post(url, `api/follow`, { url: followUrl }, token);

	return {
		ok,
		error: ok ? "" : "Follow failed, please try again",
	};
}
