if (typeof browser === "undefined") {
	var browser = chrome;
}

document.getElementById("login-form").addEventListener("submit", login);
document.getElementById("logout-form").addEventListener("submit", logout);
document.getElementById("follow-form").addEventListener("submit", follow);

// If we're not logged in, show the login panel
// If we're on a site that we're not following, show the follow panel
// If we're on a site that we're following, show some info
// Otherwise, show the other panel
loadInterface();
async function loadInterface() {
	let location = document.location.toString();

	let localStorage = await browser.storage.local.get();
	let authenticated = localStorage.authenticated ?? false;
	let following = localStorage.following ?? [];

	// Is this the site of a user that we are following?
	const followingUser = following.find((f) => location.startsWith(f.url));

	let showLogin = !authenticated;
	let showFollow = authenticated && false;
	let showInfo = authenticated && !!followingUser;
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

function follow() {
	let errorEl = document.getElementById("follow-error");

	let response = browser.runtime.sendMessage({
		query: "social-follow",
	});

	if (response.ok) {
		errorEl.style.display = "none";
		loadInterface();
	} else {
		errorEl.style.display = "block";
		errorEl.innerHTML = response.error;
	}
}
