import type { ServerEndPoint } from "@torpor/build";
import { articleList } from "../../../lib/articles/articleList";

export default {
	get: async ({ appData, url }) => {
		const query = Object.fromEntries(url.searchParams.entries());
		const limit = query.limit ? parseInt(query.limit) : undefined;
		const offset = query.offset ? parseInt(query.offset) : undefined;

		return await articleList(appData.user, appData.follower, limit, offset);
	},
} satisfies ServerEndPoint;
