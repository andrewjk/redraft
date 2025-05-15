if (typeof browser === "undefined") {
	var browser = chrome;
}

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	formatContent().then((res) => sendResponse(res));
	return true;
});

formatContent();
initializeObserver();

async function formatContent() {
	let location = document.location.toString();
	if (!location.endsWith("/")) location += "/";

	// Get authenticated, following list and url from storage
	let localStorage = await browser.storage.local.get();
	let authenticated = localStorage.authenticated ?? false;
	let following = localStorage.following ?? [];
	let url = localStorage.url ?? "--";

	// Is this our site?
	const currentUser = location.startsWith(url);

	// Is this the site of a user that we are following?
	const followingUser = following.find((f) => location.startsWith(f.url));

	// Is this the site of a user that we can follow?
	const followEl = document.head.querySelector("meta[name='social-follow-url']");
	if (followEl) {
		await browser.storage.local.set({
			followUrl: followEl.content,
			followName: document.head.querySelector("meta[name='social-follow-name']").content,
			followImage: document.head.querySelector("meta[name='social-follow-image']").content,
		});

		// Maybe update the follow form/link
		if (authenticated) {
			const formEl = document.getElementById("social-follow-form");
			const linkEl = document.getElementById("social-follow-link");
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
	for (let el of document.body.querySelectorAll("input[name='followerUrl']")) {
		el.value = url;
	}

	// Look for <input name="followerSharedKey"> and set the shared value (for commenting etc)
	if (followingUser) {
		for (let el of document.body.querySelectorAll("input[name='followerSharedKey']")) {
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
	let iconPrefix = "";
	if (showAccount) {
		// We're logged in on our site
		iconPrefix = "-blue";
	} else if (showFollow) {
		// We're logged in and the user can be followed
		iconPrefix = "-yellow";
	} else if (showInfo) {
		// We're logged in and already following this user (should this be green??)
		iconPrefix = "-green";
	}
	browser.runtime.sendMessage({
		query: "social-icon",
		iconPrefix,
	});
}

function initializeObserver() {
	// HACK: We don't currently send <:head> elements with SSR, so we need to
	// listen for changes from when the page is hydrated. This may change...
	const targetNode = document.head;
	const config = { childList: true };
	const observer = new MutationObserver((mutationList, observer) => {
		formatContent();
	});
	observer.observe(targetNode, config);
}
