import type MessageResponse from "@/types/MessageResponse";
import type { Storage } from "@/types/Storage";
import { browser } from "wxt/browser";
import { post } from "./api";

export default async function follow(): Promise<MessageResponse> {
	let { url, token, viewing } = await browser.storage.local.get<Storage>();
	if (!viewing) {
		return { ok: false, error: "No follow url supplied" };
	}

	// TODO:
	let ok = true;

	// Send them to the url to follow
	if (!url.endsWith("/")) url += "/";
	await post(url, `api/follow/send`, { url: viewing.url }, token);

	return {
		ok,
		error: ok ? "" : "Follow failed, please try again",
	};
}
