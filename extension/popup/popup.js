if (typeof browser === "undefined") {
	var browser = chrome;
}

document.getElementById("login-form").addEventListener("submit", login);
document.getElementById("logout-form").addEventListener("submit", logout);

// If we're not logged in, show the login panel
// If we're on a site that we're not following, show the follow panel
// If we're on a site that we're following, show some info
// Otherwise, show the other panel
loadInterface();
async function loadInterface() {
	let localStorage = await browser.storage.local.get();
	let authenticated = localStorage.authenticated ?? false;
	let following = localStorage.following ?? [];

	let showLogin = !authenticated;
	let showFollow = authenticated && false;
	let showInfo = authenticated && !!following.find((f) => document.location.url.startsWith(f.url));
	let showOther = authenticated && !showFollow && !showInfo;
	let showLogout = authenticated;

	document.getElementById("login-panel").style.display = showLogin ? "block" : "none";
	document.getElementById("follow-panel").style.display = showFollow ? "block" : "none";
	document.getElementById("info-panel").style.display = showInfo ? "block" : "none";
	document.getElementById("other-panel").style.display = showOther ? "block" : "none";
	document.getElementById("logout-panel").style.display = showLogout ? "block" : "none";
}

async function login(e) {
	e.preventDefault();

	let url = document.getElementById("url-input").value;
	let email = document.getElementById("email-input").value;
	let password = document.getElementById("password-input").value;

	let errorEl = document.getElementById("login-error");

	let response = await browser.runtime.sendMessage({
		query: "social-login",
		url,
		email,
		password,
	});

	if (response.ok) {
		errorEl.style.display = "none";
		loadInterface();
	} else {
		errorEl.style.display = "block";
		errorEl.innerHTML = response.error;
	}
}

function logout() {
	let errorEl = document.getElementById("logout-error");

	let response = browser.runtime.sendMessage({
		query: "social-logout",
	});

	if (response.ok) {
		errorEl.style.display = "none";
		loadInterface();
	} else {
		errorEl.style.display = "block";
		errorEl.innerHTML = response.error;
	}
}
