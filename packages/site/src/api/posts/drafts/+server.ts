import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import { draftPostList } from "../../../lib/posts/postList";

export default {
	get: async ({ appData, url }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		const query = Object.fromEntries(url.searchParams.entries());
		const limit = query.limit ? parseInt(query.limit) : undefined;
		const offset = query.offset ? parseInt(query.offset) : undefined;

		return await draftPostList(user.code, appData.user, appData.follower, limit, offset);
	},
} satisfies ServerEndPoint;
