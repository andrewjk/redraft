import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import feedSave from "../../../lib/feed/feedSave";

export default {
	post: async ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await feedSave(request, user.code);
	},
} satisfies ServerEndPoint;
