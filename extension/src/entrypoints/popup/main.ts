import { browser } from "wxt/browser";
// @ts-ignore
import placeholder from "../../assets/placeholder.png";
import type { Message, MessageResponse } from "../../types/Message";

getElement("login-form").addEventListener("submit", login);
getElement("logout-form").addEventListener("submit", logout);
getElement("refresh-form").addEventListener("submit", refresh);
getElement("follow-form").addEventListener("submit", follow);

// If we're not logged in, show the login panel
// If we're on a site that we're not following, show the follow panel
// If we're on a site that we're following, show some info
// If we're logged in, show the account panel
loadInterface();
async function loadInterface(): Promise<void> {
	let localStorage = await browser.storage.local.get();
	let authenticated = localStorage.authenticated ?? false;
	let showFollow = localStorage.showFollow;
	let showInfo = localStorage.showInfo;
	let following = localStorage.following;

	getElement("login-panel").style.display = !authenticated ? "block" : "none";
	getElement("follow-panel").style.display = showFollow ? "block" : "none";
	getElement("info-panel").style.display = showInfo ? "block" : "none";
	getElement("account-panel").style.display = authenticated ? "block" : "none";

	if (authenticated) {
		let { profile } = localStorage;
		getElement<HTMLImageElement>("profile-image").src = profile.image || placeholder;
		getElement("profile-name").innerText = profile.name;
		getElement<HTMLLinkElement>("profile-url").href = profile.url;
		getElement<HTMLParagraphElement>("follow-count").innerText =
			`Following ${following.length} account${following.length === 1 ? "" : "s"}`;
	}

	if (showFollow) {
		let { /*followUrl,*/ followName, followImage } = localStorage;
		getElement<HTMLImageElement>("follow-image").src = followImage || placeholder;
		getElement("follow-name").innerText = followName;
		//getElement("follow-url").innerText = followUrl;
	}

	if (showInfo) {
		let { /*followUrl,*/ followName, followImage } = localStorage;
		getElement<HTMLImageElement>("info-image").src = followImage || placeholder;
		getElement("info-name").innerText = followName;
		//getElement("info-url").innerText = followUrl;
	}
}

async function login(e: SubmitEvent) {
	e.preventDefault();

	let url = getElement<HTMLInputElement>("url-input").value;
	let email = getElement<HTMLInputElement>("email-input").value;
	let password = getElement<HTMLInputElement>("password-input").value;

	let errorEl = getElement("login-error");

	let response = await browser.runtime.sendMessage<Message, MessageResponse>({
		name: "login",
		data: { url, email, password },
	});

	if (response.ok) {
		errorEl.style.display = "none";
		loadInterface();
	} else {
		errorEl.style.display = "block";
		errorEl.innerHTML = response.error;
	}
}

async function logout(e: SubmitEvent) {
	e.preventDefault();

	let errorEl = getElement("logout-error");

	let response = await browser.runtime.sendMessage<Message, MessageResponse>({
		name: "logout",
	});

	if (response.ok) {
		errorEl.style.display = "none";
		loadInterface();
	} else {
		errorEl.style.display = "block";
		errorEl.innerHTML = response.error;
	}
}

async function refresh(e: SubmitEvent) {
	e.preventDefault();

	let errorEl = getElement("refresh-error");

	let response = await browser.runtime.sendMessage<Message, MessageResponse>({
		name: "refresh",
	});

	if (response.ok) {
		errorEl.style.display = "none";
		loadInterface();
	} else {
		errorEl.style.display = "block";
		errorEl.innerHTML = response.error;
	}
}

async function follow(e: SubmitEvent) {
	e.preventDefault();

	let errorEl = getElement("follow-error");

	let response = await browser.runtime.sendMessage<Message, MessageResponse>({
		name: "follow",
	});

	if (response.ok) {
		errorEl.style.display = "none";
		getElement("follow-message").style.display = "block";
		loadInterface();
	} else {
		errorEl.style.display = "block";
		errorEl.innerHTML = response.error;
	}
}

function getElement<T = HTMLElement>(id: string): T {
	return document.getElementById(id)! as T;
}
