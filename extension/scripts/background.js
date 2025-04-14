if (typeof browser === "undefined") {
	var browser = chrome;
}

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

	// If logged in, store somewhere
	if (ok) {
		await browser.storage.local.set({ url, email, authenticated: true });

		// TODO: Refresh this every now and then...
		const followingResponse = await fetch(`${url}api/extension/following`);
		if (followingResponse.ok) {
			const following = await followingResponse.json();
			await browser.storage.local.set({ following: following.following });
		}
	}

	return {
		ok,
		error: ok ? "" : "Login failed, please try again",
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
