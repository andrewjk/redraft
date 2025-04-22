import articleList from "@/lib/articles/articleList";
import type { ServerEndPoint } from "@torpor/build";

export default {
	get: async ({ url }) => {
		const query = Object.fromEntries(url.searchParams.entries());
		const limit = query.limit ? parseInt(query.limit) : undefined;
		const offset = query.offset ? parseInt(query.offset) : undefined;

		return await articleList(true, limit, offset);
	},
} satisfies ServerEndPoint;
