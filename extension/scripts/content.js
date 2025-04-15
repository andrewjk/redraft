if (typeof browser === "undefined") {
	var browser = chrome;
}

formatContent();
initializeObserver();

async function formatContent() {
	let location = document.location.toString();

	// Get authenticated, following list and url from storage
	let localStorage = await browser.storage.local.get();
	let authenticated = localStorage.authenticated ?? false;
	let following = localStorage.following ?? [];
	let url = localStorage.url ?? "--";

	// Is this the site of a user that we are following?
	const followingUser = following.find((f) => location.startsWith(f.url));
	const followEl = document.head.querySelector("meta[name='social-follow']");
	if (followEl) {
		await browser.storage.local.set({ followUrl: followEl.content });
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
	let showAccount = authenticated && location.startsWith(url);
	let showInfo = authenticated && !!followingUser;
	let showFollow = authenticated && !!followEl;

	// Set the icon color
	let iconPrefix = "";
	if (showAccount) {
		iconPrefix = "-blue";
	} else if (showInfo) {
		iconPrefix = "-red";
	} else if (showFollow) {
		iconPrefix = "-yellow";
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
