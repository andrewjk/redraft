import { browser } from "wxt/browser";
import type { LoginData, MessageResponse } from "../../types/Message";
import { loadFollowers } from "./loadFollowers";
import { loadProfile } from "./loadProfile";

export async function login(data: LoginData): Promise<MessageResponse> {
	let { url, email, password } = data;

	// Send them to the url to login
	if (!url.endsWith("/")) {
		url += "/";
	}
	const loginResponse = await fetch(`${url}api/account/login`, {
		method: "POST",
		body: JSON.stringify({ email, password }),
	});
	const ok = loginResponse.ok;

	// If logged in ok, store things
	if (ok) {
		const { token } = await loginResponse.json<{ token: string }>();

		await browser.storage.local.set({ url, email, authenticated: true, token });

		await Promise.all([loadProfile(), loadFollowers()]);
	}

	return {
		ok,
		error: ok ? "" : "Login failed, please try again",
	};
}
