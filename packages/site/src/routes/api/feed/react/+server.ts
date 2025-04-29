import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import feedReact from "../../../../lib/feed/feedReact";

export default {
	post: async ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await feedReact(request, user.code);
	},
} satisfies ServerEndPoint;
