import type LoginData from "@/types/LoginData";
import type SetIconData from "@/types/SetIconData";
import type { BackgroundDefinition } from "wxt";
import { browser } from "wxt/browser";
import { defineBackground } from "wxt/utils/define-background";
import type Message from "../../types/Message";
import follow from "./follow";
import login from "./login";
import logout from "./logout";
import refresh from "./refresh";
import { setIcon } from "./setIcon";

// TODO: Always send the "Follow" form, and show it if logged into the extension
// Otherwise, show a "Follow" link, which goes to the follow page

const background: BackgroundDefinition = defineBackground({
	main() {
		browser.tabs.onActivated.addListener(({ tabId }) => {
			browser.tabs.sendMessage(tabId, {});
		});

		browser.tabs.onUpdated.addListener((tabId, changeInfo) => {
			if (changeInfo.status === "complete") {
				browser.tabs.sendMessage(tabId, {});
			}
		});

		browser.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
			switch (message.name) {
				case "login": {
					login(message.data as LoginData).then((res) => sendResponse(res));
					return true;
				}
				case "logout": {
					logout().then((res) => sendResponse(res));
					return true;
				}
				case "refresh": {
					refresh().then((res) => sendResponse(res));
					return true;
				}
				case "follow": {
					follow().then((res) => sendResponse(res));
					return true;
				}
				case "set-icon": {
					setIcon(message.data as SetIconData);
					return false;
				}
			}
		});
	},
});

export default background;
