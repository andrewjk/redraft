if (typeof browser === "undefined") {
	var browser = chrome;
}

document.getElementById("login-form").addEventListener("submit", login);
document.getElementById("logout-form").addEventListener("submit", logout);
document.getElementById("follow-form").addEventListener("submit", follow);

// If we're not logged in, show the login panel
// If we're on a site that we're not following, show the follow panel
// If we're on a site that we're following, show some info
// If we're logged in, show the account panel
loadInterface();
async function loadInterface() {
	let localStorage = await browser.storage.local.get();
	let authenticated = localStorage.authenticated ?? false;
	let showFollow = localStorage.showFollow;
	let showInfo = localStorage.showInfo;
	document.getElementById("login-panel").style.display = !authenticated ? "block" : "none";
	document.getElementById("follow-panel").style.display = showFollow ? "block" : "none";
	document.getElementById("info-panel").style.display = showInfo ? "block" : "none";
	document.getElementById("account-panel").style.display = authenticated ? "block" : "none";

	if (authenticated) {
		let { profile } = localStorage;
		document.getElementById("profile-image").src = profile.image;
		document.getElementById("profile-name").innerText = profile.name;
		document.getElementById("profile-url").href = profile.url;
	}
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
