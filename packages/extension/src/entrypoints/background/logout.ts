import type MessageResponse from "@/types/MessageResponse";
import type { Storage } from "@/types/Storage";
import { browser } from "wxt/browser";
import { post } from "./api";

export default async function logout(): Promise<MessageResponse> {
	let ok = true;

	// Delete the token on the server, so it can no longer be used
	const { url, token } = await browser.storage.local.get<Storage>();
	if (url && token) {
		try {
			await post(url, `api/account/logout`, null, token);
		} catch {
			// Ignore server errors (e.g. when offline), local logout still applies
		}
	}

	if (ok) {
		await browser.storage.session.clear();

		// Remove the header injection rules, so no tokens are sent anymore
		const rules = await browser.declarativeNetRequest.getDynamicRules();
		await browser.declarativeNetRequest.updateDynamicRules({
			removeRuleIds: rules.map((r) => r.id),
		});

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
