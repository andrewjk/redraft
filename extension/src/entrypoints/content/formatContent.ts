import { browser } from "wxt/browser";
import type { Message, MessageResponse } from "../../types/Message";
import type { Storage } from "../../types/Storage";

export async function formatContent(): Promise<void> {
	let location = document.location.toString();
	if (!location.endsWith("/")) location += "/";

	// Get authenticated, following list and url from storage
	let localStorage = await browser.storage.local.get<Storage>();
	let authenticated = localStorage.authenticated ?? false;
	let following = localStorage.following ?? [];
	let url = localStorage.url ?? "--";

	// Is this our site?
	const currentUser = location.startsWith(url);

	// Is this the site of a user that we are following?
	const followingUser = following.find((f) => location.startsWith(f.url));

	// Is this the site of a user that we can follow?
	const followEl = getMetaElement("social-follow-url");
	if (followEl) {
		await browser.storage.local.set({
			followUrl: followEl.content,
			followName: getMetaElement("social-follow-name")?.content,
			followImage: getMetaElement("social-follow-image")?.content,
		});

		// Maybe update the follow form/link
		if (authenticated) {
			const formEl = document.getElementById("social-follow-form") as HTMLFormElement | null;
			const linkEl = document.getElementById("social-follow-link") as HTMLLinkElement | null;
			if (formEl && linkEl) {
				if (followingUser) {
					formEl.action = `${url}unfollow`;
				} else {
					formEl.action = `${url}follow`;
				}
				formEl.style.display = "inline-block";
				linkEl.style.display = "none";
			}
		}
	}

	// Look for <input name="followerUrl"> and set our url (for following another user)
	for (let el of getInputElements("followerUrl")) {
		el.value = url;
	}

	// Look for <input name="followerSharedKey"> and set the shared value (for commenting etc)
	if (followingUser) {
		for (let el of getInputElements("followerSharedKey")) {
			el.value = followingUser.shared_key;
		}
	}

	// Look for our own URL, and display the icon in blue if found
	// Look for a following record, and display the icon in red if found
	// Look for <meta name="social-follow">url</meta> and display the icon in yellow if found
	let showFollow = authenticated && !currentUser && !followingUser && !!followEl;
	let showInfo = authenticated && !!followingUser;
	let showAccount = authenticated && location.startsWith(url);

	// Store the state in localStorage for access from e.g. popup.js
	await browser.storage.local.set({ showFollow, showInfo });

	// Set the icon color
	let prefix = "";
	if (showAccount) {
		// We're logged in on our site
		prefix = "-blue";
	} else if (showFollow) {
		// We're logged in and the user can be followed
		prefix = "-yellow";
	} else if (showInfo) {
		// We're logged in and already following this user (should this be green??)
		prefix = "-green";
	}
	browser.runtime.sendMessage<Message, MessageResponse>({
		name: "set-icon",
		data: { prefix: prefix },
	});
}

function getMetaElement(name: string): HTMLMetaElement | null {
	return document.head.querySelector<HTMLMetaElement>(`meta[name='${name}']`);
}

function getInputElements(name: string): NodeListOf<HTMLInputElement> {
	return document.head.querySelectorAll<HTMLInputElement>(`input[name='${name}']`);
}
