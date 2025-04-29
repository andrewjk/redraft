import type { ServerEndPoint } from "@torpor/build";
import { notFound, ok, unauthorized } from "@torpor/build/response";
import loadLinkInfo from "../../../../lib/utils/loadLinkInfo";

export default {
	get: async ({ appData, url, cookies }) => {
		// HACK: Have to do our own cookie loading here
		// Need to support +server.ts files in /routes
		const jwt = cookies.get("jwt");
		try {
			appData.user = jwt ? JSON.parse(atob(jwt)) : null;
		} catch {
			// Just delete the cookie if it has some bad data in it, and then
			// the user can log back in
			cookies.delete("jwt", { path: "/" });
		}

		const link = url.searchParams.get("url");
		if (!link) {
			return notFound();
		}

		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		const info = await loadLinkInfo(link);

		return ok(info);
	},
} satisfies ServerEndPoint;
