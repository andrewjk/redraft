import type { Following, Storage } from "@/types/Storage";

export default async function setFollowingRules(following: Following[]) {
	const { url, domain, token } = await browser.storage.local.get<Storage>();

	const { MODIFY_HEADERS } = browser.declarativeNetRequest.RuleActionType;
	const { SET: SET_HEADER } = browser.declarativeNetRequest.HeaderOperation;
	const ALL_RESOURCE_TYPES = Object.values(browser.declarativeNetRequest.ResourceType);

	let addRules = [
		{
			id: 1,
			priority: 1,
			action: {
				type: MODIFY_HEADERS,
				requestHeaders: [
					{
						operation: SET_HEADER,
						header: "X-Social-User",
						value: token,
					},
				],
			},
			condition: {
				// NOTE: Anchored at URL boundaries so that e.g. `https://x/user`
				// matches `https://x/user` and `https://x/user/posts`, but not
				// `https://user.evil.io` or `https://x/user2`
				regexFilter: siteFilter(domain || url),
				resourceTypes: ALL_RESOURCE_TYPES,
			},
		},
	];

	addRules.push(
		...following
			.filter((f): f is Following & { token: string } => !!f.url && !!f.token && f.approved)
			.map((f, i) => ({
				id: i + 2,
				priority: 1,
				action: {
					type: MODIFY_HEADERS,
					requestHeaders: [
						{
							operation: SET_HEADER,
							header: "X-Social-Follower",
							value: f.token,
						},
					],
				},
				condition: {
					regexFilter: siteFilter(f.url),
					resourceTypes: ALL_RESOURCE_TYPES,
				},
			})),
	);

	const oldRules = await browser.declarativeNetRequest.getDynamicRules();
	browser.declarativeNetRequest.updateDynamicRules({
		// Remove all dynamic rules
		removeRuleIds: oldRules.map((r) => r.id),
		// Add new rules
		addRules,
	});
}

function siteFilter(url: string): string {
	const trimmed = url.replace(/\/$/, "");
	const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	return `^${escaped}(/|\\?|#|$)`;
}
