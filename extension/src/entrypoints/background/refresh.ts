import type MessageResponse from "@/types/MessageResponse";
import { browser } from "wxt/browser";
import { get } from "./api";
import setFollowingRules from "./setFollowingRules";

export default async function refresh(): Promise<MessageResponse> {
	const { authenticated } = await browser.storage.local.get();
	if (!authenticated) {
		return { ok: false, error: "Not authenticated" };
	}

	// TODO:
	let ok = true;

	const { url, token, following, loadedAt } = await browser.storage.local.get();
	const data = await get<any>(url, `api/extension/refresh?from=${loadedAt}`, token);
	if (data) {
		if (data.following) {
			for (let newf of data.following) {
				const index = following.findIndex((f: any) => f.url === newf.url);
				if (newf.deleted) {
					if (index !== -1) {
						following.splice(index, 1);
					}
				} else {
					if (index === -1) {
						following.push(newf);
					} else {
						following[index] = newf;
					}
				}
			}
			following.sort((a: any, b: any) => a.approved - b.approved || a.name.localeCompare(b.name));
		}

		await browser.storage.local.set({
			profile: data.profile,
			following,
			notificationCount: data.notificationCount,
			messageCount: data.messageCount,
			loadedAt: new Date().getTime(),
		});

		await setFollowingRules(following);
	}

	// TODO: Handle errors

	return {
		ok,
		error: ok ? "" : "Refresh failed, please try again",
	};
}
