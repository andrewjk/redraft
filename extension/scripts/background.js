if (typeof browser === "undefined") {
	var browser = chrome;
}

// TODO: Always send the "Follow" form, and show it if logged into the extension
// Otherwise, show a "Follow" link, which goes to the follow page

browser.tabs.onActivated.addListener(({ tabId }) => {
	browser.tabs.sendMessage(tabId, {});
});

browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
	if (changeInfo.status === "complete") {
		browser.tabs.sendMessage(tabId, {});
	}
});

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch (request.query) {
		case "social-login": {
			login(request).then((res) => sendResponse(res));
			return true;
		}
		case "social-logout": {
			logout(request).then((res) => sendResponse(res));
			return true;
		}
		case "social-follow": {
			follow(request).then((res) => sendResponse(res));
			return true;
		}
		case "social-icon": {
			let iconPrefix = request.iconPrefix;
			browser.action.setIcon({
				path: {
					16: `../images/icon${iconPrefix}-16.png`,
					32: `../images/icon${iconPrefix}-32.png`,
					48: `../images/icon${iconPrefix}-48.png`,
					128: `../images/icon${iconPrefix}-128.png`,
				},
			});
			return false;
		}
	}
});

async function login(request) {
	const { url, email, password } = request;

	// Send them to the url to login
	if (!url.endsWith("/")) url += "/";
	const loginResponse = await fetch(`${url}api/account/login`, {
		method: "POST",
		body: JSON.stringify({ email, password }),
	});
	const ok = loginResponse.ok;

	// If logged in ok, store things
	if (ok) {
		const { token } = await loginResponse.json();

		await browser.storage.local.set({ url, email, authenticated: true, token });

		await Promise.all([loadProfile(), loadFollowers()]);
	}

	return {
		ok,
		error: ok ? "" : "Login failed, please try again",
	};
}

// TODO: Refresh this every now and then...
async function loadProfile() {
	const { url, token } = await browser.storage.local.get();
	const profile = await api("get", url, `api/extension/profile`, token);
	if (profile) {
		await browser.storage.local.set({ profile });
	}

	// TODO: Handle errors
}

// TODO: Refresh this every now and then...
async function loadFollowers() {
	const { url, token } = await browser.storage.local.get();
	const followingData = await api("get", url, `api/extension/following`, token);
	if (followingData) {
		//const followingData = await followingResponse.json();
		const following = followingData.following;
		console.log("GOT", followingData);
		await browser.storage.local.set({ following });

		const { MODIFY_HEADERS } = browser.declarativeNetRequest.RuleActionType;
		const { SET: SET_HEADER } = browser.declarativeNetRequest.HeaderOperation;
		const ALL_RESOURCE_TYPES = Object.values(chrome.declarativeNetRequest.ResourceType);

		const addRules = following
			.filter((f) => !!f.url && !!f.token)
			.map((f, i) => ({
				id: i + 1,
				priority: 1,
				action: {
					type: MODIFY_HEADERS,
					requestHeaders: [
						{
							operation: SET_HEADER,
							header: "x-social-follower",
							value: f.token,
						},
					],
				},
				condition: {
					urlFilter: `${f.url}*`,
					resourceTypes: ALL_RESOURCE_TYPES,
				},
			}));

		const oldRules = await browser.declarativeNetRequest.getDynamicRules();
		browser.declarativeNetRequest.updateDynamicRules({
			// Remove all dynamic rules
			removeRuleIds: oldRules.map((r) => r.id),
			// Add new rules
			addRules,
		});
	}

	// TODO: Handle errors
}

async function follow() {
	const { url, followUrl } = await browser.storage.local.get();
	if (!followUrl) {
		throw new Error("No follow url supplied");
	}

	// Send them to the url to follow
	if (!url.endsWith("/")) url += "/";
	const followResponse = await fetch(`${url}api/follow`, {
		method: "POST",
		body: JSON.stringify({ url: followUrl }),
	});
	const ok = followResponse.ok;

	// TODO: Show a "request sent" page?

	return {
		ok,
		error: ok ? "" : "Follow failed, please try again",
	};
}

async function logout() {
	// TODO: Should call api/account/logout to delete tokens etc
	const ok = true;

	if (ok) {
		await browser.storage.local.set({ authenticated: false, following: [], url: "", email: "" });
	}

	return {
		ok,
		error: ok ? "" : "Logout failed, please try again",
	};
}

/** Sends a request to the API with authentication etc */
async function api(method, base, path, token) {
	console.log(`sending extension request to '${base}${path}'`);

	const options = {
		method,
		headers: new Headers(),
	};

	//if (data) {
	//	options.headers.append("Content-Type", "application/json");
	//	options.body = JSON.stringify(data);
	//}

	if (token) {
		options.headers.append("Authorization", `Token ${token}`);
	}

	const result = await fetch(`${base}${path}`, options);

	if (result.ok || result.status === 422) {
		const text = await result.text();
		const data = text ? JSON.parse(text) : {};
		return data;
	}

	throw new Error(result.status.toString());
}
