import tagPostList from "@/lib/tags/tagPostList";
import type { ServerEndPoint } from "@torpor/build";

export default {
	get: async ({ url, params }) => {
		const query = Object.fromEntries(url.searchParams.entries());
		const limit = query.limit ? parseInt(query.limit) : undefined;
		const offset = query.offset ? parseInt(query.offset) : undefined;

		return await tagPostList(params.slug, false, limit, offset);
	},
} satisfies ServerEndPoint;
