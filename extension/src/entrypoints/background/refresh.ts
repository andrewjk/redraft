import type MessageResponse from "@/types/MessageResponse";
import { browser } from "wxt/browser";
import loadFollowers from "./loadFollowers";
import loadProfile from "./loadProfile";

export default async function refresh(): Promise<MessageResponse> {
	const { authenticated } = await browser.storage.local.get();
	if (!authenticated) {
		return { ok: false, error: "Not authenticated" };
	}

	// TODO:
	let ok = true;

	await Promise.all([loadProfile(), loadFollowers()]);

	return {
		ok,
		error: ok ? "" : "Refresh failed, please try again",
	};
}
