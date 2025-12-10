import type MessageResponse from "@/types/MessageResponse";
import { browser } from "wxt/browser";
import type Message from "../../types/Message";
import type { Storage } from "../../types/Storage";

let formEl: HTMLFormElement | undefined | null;

export default async function formatContent(): Promise<void> {
	if (formEl) {
		formEl.removeEventListener("submit", onFormSubmit);
	}

	let location = document.location.toString();
	if (!location.endsWith("/")) location += "/";

	// Get authenticated, following list and url from storage
	let localStorage = await browser.storage.local.get<Storage>();
	let authenticated = localStorage.authenticated ?? false;
	let followingList = localStorage.following ?? [];
	let url = localStorage.url ?? "--";

	// Is this our site?
	const currentUser = location.startsWith(url);

	// Is this the site of a user that we are following?
	const user = followingList.find((f) => location.startsWith(f.url));
	const following = user?.approved === true;
	const requested = user?.approved === false;

	// Is this the site of a user that we can follow?
	const followEl = getMetaElement("social-follow-url");
	if (followEl) {
		await browser.storage.local.set({
			viewing: {
				url: followEl.content,
				name: getMetaElement("social-follow-name")?.content,
				image: getMetaElement("social-follow-image")?.content,
				following,
				requested,
			},
		});

		// Maybe update the follow form/link
		if (authenticated) {
			formEl = document.getElementById("social-follow-form") as HTMLFormElement | null;
			if (formEl) {
				formEl.addEventListener("submit", onFormSubmit);
				const buttonEl = formEl.getElementsByTagName("button")[0];
				if (buttonEl) {
					if (following) {
						buttonEl.textContent = "Unfollow";
					} else if (requested) {
						buttonEl.textContent = "Requested...";
						buttonEl.disabled = true;
					} else {
						buttonEl.textContent = "Follow";
					}
				}
			}
			const linkEl = document.getElementById("social-follow-link") as HTMLLinkElement | null;
			if (formEl && linkEl) {
				if (following) {
					formEl.action = `${url}unfollow`;
				} else {
					formEl.action = `${url}follow`;
				}
				formEl.style.display = "inline-block";
				linkEl.style.display = "none";
			}
		}
	} else {
		await browser.storage.local.set({
			viewing: null,
		});
	}

	// Look for our own URL, and display the icon in yellow if found
	// Look for a following record, and display the icon in red if found
	// Look for <meta name="social-follow">url</meta> and display the icon in yellow if found
	let showFollow = authenticated && !currentUser && !following && !!followEl;
	let showInfo = authenticated && following;
	let showAccount = authenticated && location.startsWith(url);

	// Store the state in localStorage for access from e.g. popup.js
	await browser.storage.local.set({ showFollow, showInfo });

	browser.runtime.sendMessage<Message, MessageResponse>({
		name: "update",
	});

	// Set the icon color
	let prefix = "";
	if (showAccount) {
		// We're logged in on our site
		prefix = "-yellow";
	} else if (showFollow) {
		// We're logged in and the user can be followed
		prefix = "-green";
	} else if (showInfo) {
		// We're logged in and already following this user
		prefix = "-blue";
	}
	browser.runtime.sendMessage<Message, MessageResponse>({
		name: "set-icon",
		data: { prefix: prefix },
	});
}

function getMetaElement(name: string): HTMLMetaElement | null {
	return document.head.querySelector<HTMLMetaElement>(`meta[name='${name}']`);
}

//function getInputElements(name: string): NodeListOf<HTMLInputElement> {
//	return document.head.querySelectorAll<HTMLInputElement>(`input[name='${name}']`);
//}

async function onFormSubmit() {
	await browser.runtime.sendMessage<Message, MessageResponse>({
		name: "delayed-refresh",
	});
}
