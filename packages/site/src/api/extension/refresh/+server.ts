import type { ServerEndPoint } from "@torpor/build";
import { badRequest, unauthorized } from "@torpor/build/response";
import extensionRefresh from "../../../lib/extension/extensionRefresh";

export default {
	get: async ({ appData, url }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		const query = Object.fromEntries(url.searchParams.entries());
		if (!query.from || isNaN(parseInt(query.from))) {
			return badRequest();
		}

		return await extensionRefresh(parseInt(query.from), user.code);
	},
} satisfies ServerEndPoint;
