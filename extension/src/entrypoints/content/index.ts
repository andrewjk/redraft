import type { ContentScriptDefinition } from "wxt";
import { browser } from "wxt/browser";
import type { ContentScriptContext } from "wxt/utils/content-script-context";
import { defineContentScript } from "wxt/utils/define-content-script";
import { formatContent } from "./formatContent";
import { initializeObserver } from "./initializeObserver";

const contentScript: ContentScriptDefinition = defineContentScript({
	// We need to match all urls, although we will only change ones belonging to
	// users that this user follows, to add authentication headers
	matches: ["<all_urls>"],
	main(_ctx: ContentScriptContext) {
		browser.runtime.onMessage.addListener((_request, _sender, sendResponse) => {
			formatContent().then((res) => sendResponse(res));
			return true;
		});

		formatContent();
		initializeObserver();
	},
});

export default contentScript;
