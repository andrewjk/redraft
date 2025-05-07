import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import tagPostList from "../../../../../lib/tags/tagPostList";

export default {
	get: async ({ appData, url, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		const query = Object.fromEntries(url.searchParams.entries());
		const limit = query.limit ? parseInt(query.limit) : undefined;
		const offset = query.offset ? parseInt(query.offset) : undefined;

		return await tagPostList(params.slug, true, limit, offset);
	},
} satisfies ServerEndPoint;
