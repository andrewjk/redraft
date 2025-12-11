import type LoginData from "@/types/LoginData";
import type MessageResponse from "@/types/MessageResponse";
import { browser } from "wxt/browser";
import load from "./load";

export default async function login(data: LoginData): Promise<MessageResponse> {
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
		const { domain, token } = await loginResponse.json();

		await browser.storage.local.set({
			url,
			email,
			authenticated: true,
			domain: domain ?? null,
			token,
		});

		//await Promise.all([loadProfile(), loadFollowers()]);
		await load();
	}

	return {
		ok,
		error: ok ? "" : "Login failed, please try again",
	};
}
