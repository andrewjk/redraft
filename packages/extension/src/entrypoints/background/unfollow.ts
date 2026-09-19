import type MessageResponse from "@/types/MessageResponse";
import type { Session, Storage } from "@/types/Storage";
import { browser } from "wxt/browser";
import { post } from "./api";

export default async function unfollow(): Promise<MessageResponse> {
	let { url, viewing } = await browser.storage.local.get<Storage>();
	let { token } = await browser.storage.session.get<Session>();
	if (!viewing) {
		return { ok: false, error: "No unfollow url supplied" };
	}

	// TODO:
	let ok = true;

	// Send them to the url to follow
	if (!url.endsWith("/")) url += "/";
	await post(url, `api/unfollow`, { url: viewing.url }, token);

	return {
		ok,
		error: ok ? "" : "Unfollow failed, please try again",
	};
}
