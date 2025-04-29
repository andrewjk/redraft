import type { ServerEndPoint } from "@torpor/build";
import articleList from "../../../lib/articles/articleList";

export default {
	get: async ({ url }) => {
		const query = Object.fromEntries(url.searchParams.entries());
		const limit = query.limit ? parseInt(query.limit) : undefined;
		const offset = query.offset ? parseInt(query.offset) : undefined;

		return await articleList(false, limit, offset);
	},
} satisfies ServerEndPoint;
