import type { Session, Storage } from "@/types/Storage";
import { publicFollowing } from "@/types/Storage";
import { browser } from "wxt/browser";
import { get } from "./api";
import setFollowingRules from "./setFollowingRules";

export default async function load(): Promise<void> {
	const { url, token } = await browser.storage.local.get<Storage>();
	const data = await get<any>(url, `api/extension/load`, token);
	if (data) {
		await browser.storage.session.set<Session>({
			following: data.following,
		});
		await browser.storage.local.set({
			profile: data.profile,
			following: publicFollowing(data.following),
			notificationCount: data.notificationCount,
			messageCount: data.messageCount,
			loadedAt: new Date().getTime(),
		});

		await setFollowingRules(data.following);
	}

	// TODO: Handle errors
}
