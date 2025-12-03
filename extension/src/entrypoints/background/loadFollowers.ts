import { browser } from "wxt/browser";
import type { Following, Storage } from "../../types/Storage";
import { get } from "./api";

// TODO: Refresh this every now and then...

export async function loadFollowers(): Promise<void> {
	const { url, token } = await browser.storage.local.get();
	const followingData = await get<{ following: Following[] }>(
		url,
		`api/extension/following`,
		token,
	);
	if (followingData) {
		//const followingData = await followingResponse.json();
		const following = followingData.following;
		await browser.storage.local.set<Storage>({ following });

		const { MODIFY_HEADERS } = browser.declarativeNetRequest.RuleActionType;
		const { SET: SET_HEADER } = browser.declarativeNetRequest.HeaderOperation;
		const ALL_RESOURCE_TYPES = Object.values(browser.declarativeNetRequest.ResourceType);

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
					// NOTE: We're stripping the trailing slash so that e.g.
					// `https://redraft.social/user/` will match
					// `https://redraft.social/user`
					urlFilter: `${f.url.replace(/\/$/, "")}*`,
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
