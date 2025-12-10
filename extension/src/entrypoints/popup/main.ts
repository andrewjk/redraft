import type MessageResponse from "@/types/MessageResponse";
import { mount } from "@torpor/view";
import { browser } from "wxt/browser";
import $state from "../$state";
import type Message from "../../types/Message";
// @ts-ignore
import Popup from "./Popup.torp";

// If we're not logged in, show the login panel
// If we're on a site that we're not following, show the follow panel
// If we're on a site that we're following, show some info
// If we're logged in, show the account panel
loadInterface();
async function loadInterface(): Promise<void> {
	let localStorage = await browser.storage.local.get();
	$state.authenticated = localStorage.authenticated ?? false;
	if ($state.authenticated) {
		$state.user = localStorage.profile;
		$state.following = localStorage.following;
	}
	$state.following = localStorage.following;
	$state.viewing = localStorage.viewing;

	$state.followMessage = undefined;

	$state.login = login;
	$state.logout = logout;
	$state.refresh = refresh;
	$state.follow = follow;
}

browser.runtime.onMessage.addListener((message: Message, _sender, _sendResponse) => {
	switch (message.name) {
		case "update": {
			loadInterface();
			break;
		}
	}
});

async function login(e: SubmitEvent) {
	e.preventDefault();

	let url = getElement<HTMLInputElement>("url-input").value;
	let email = getElement<HTMLInputElement>("email-input").value;
	let password = getElement<HTMLInputElement>("password-input").value;

	$state.loginError = undefined;

	let response = await browser.runtime.sendMessage<Message, MessageResponse>({
		name: "login",
		data: { url, email, password },
	});

	if (response.ok) {
		loadInterface();
	} else {
		$state.loginError = response.error;
	}
}

async function logout(e: SubmitEvent) {
	e.preventDefault();

	$state.logoutError = undefined;

	let response = await browser.runtime.sendMessage<Message, MessageResponse>({
		name: "logout",
	});

	if (response.ok) {
		loadInterface();
	} else {
		$state.logoutError = response.error;
	}
}

async function refresh(e: SubmitEvent) {
	e.preventDefault();

	$state.refreshError = undefined;

	let response = await browser.runtime.sendMessage<Message, MessageResponse>({
		name: "refresh",
	});

	if (response.ok) {
		loadInterface();
	} else {
		$state.refreshError = response.error;
	}
}

async function follow(e: SubmitEvent) {
	e.preventDefault();

	$state.followError = undefined;

	let response = await browser.runtime.sendMessage<Message, MessageResponse>({
		name: "follow",
	});

	if (response.ok) {
		$state.followMessage = "Follow requested";
	} else {
		$state.followError = response.error;
	}
}

function getElement<T = HTMLElement>(id: string): T {
	return document.getElementById(id)! as T;
}

// Mount Popup.torp into index.html
mount(document.getElementById("app")!, Popup, $state);
