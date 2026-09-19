import type MessageResponse from "@/types/MessageResponse";
import type { Session, Storage } from "@/types/Storage";
import { publicFollowing } from "@/types/Storage";
import { browser } from "wxt/browser";
import { get } from "./api";
import load from "./load";
import setFollowingRules from "./setFollowingRules";

export default async function refresh(): Promise<MessageResponse> {
	const { authenticated } = await browser.storage.local.get<Storage>();
	if (!authenticated) {
		return { ok: false, error: "Not authenticated" };
	}

	// TODO:
	let ok = true;

	const { url, token, loadedAt } = await browser.storage.local.get<Storage>();
	const { following } = await browser.storage.session.get<Session>();
	if (!following) {
		// Session state is empty (e.g. after a browser restart), so get
		// everything from the server instead of a delta update
		await load();
		return { ok, error: ok ? "" : "Refresh failed, please try again" };
	}
	const currentFollowing = following;

	const data = await get<any>(url, `api/extension/refresh?from=${loadedAt}`, token);
	if (data) {
		if (data.following) {
			for (let newf of data.following) {
				const index = currentFollowing.findIndex((f: any) => f.url === newf.url);
				if (newf.deleted) {
					if (index !== -1) {
						currentFollowing.splice(index, 1);
					}
				} else {
					if (index === -1) {
						currentFollowing.push(newf);
					} else {
						currentFollowing[index] = newf;
					}
				}
			}
			currentFollowing.sort(
				(a: any, b: any) => a.approved - b.approved || a.name.localeCompare(b.name),
			);
		}

		await browser.storage.session.set<Session>({ following: currentFollowing });
		await browser.storage.local.set({
			profile: data.profile,
			following: publicFollowing(currentFollowing),
			notificationCount: data.notificationCount,
			messageCount: data.messageCount,
			loadedAt: new Date().getTime(),
		});

		await setFollowingRules(currentFollowing);
	}

	// TODO: Handle errors

	return {
		ok,
		error: ok ? "" : "Refresh failed, please try again",
	};
}
