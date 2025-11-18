import type { ServerEndPoint } from "@torpor/build";
import { postList } from "../../lib/posts/postList";

export default {
	get: async ({ appData, url }) => {
		const query = Object.fromEntries(url.searchParams.entries());
		const limit = query.limit ? parseInt(query.limit) : undefined;
		const offset = query.offset ? parseInt(query.offset) : undefined;

		return await postList(appData.user, appData.follower, limit, offset);
	},
} satisfies ServerEndPoint;
