import feedList from "@/lib/feed/feedList";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	get: async ({ appData, url }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		const query = Object.fromEntries(url.searchParams.entries());
		const limit = query.limit ? parseInt(query.limit) : undefined;
		const offset = query.offset ? parseInt(query.offset) : undefined;
		const liked = query.liked !== undefined ? true : undefined;
		const saved = query.saved !== undefined ? true : undefined;

		return await feedList(user.code, limit, offset, liked, saved);
	},
} satisfies ServerEndPoint;
