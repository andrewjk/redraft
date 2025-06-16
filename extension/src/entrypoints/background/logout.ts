import { browser } from "wxt/browser";
import type { MessageResponse } from "../../types/Message";

export async function logout(): Promise<MessageResponse> {
	// TODO: Should call api/account/logout to delete tokens etc
	let ok = true;

	if (ok) {
		await browser.storage.local.set({
			authenticated: false,
			following: [],
			url: "",
			email: "",
		});
	}

	return {
		ok,
		error: ok ? "" : "Logout failed, please try again",
	};
}
