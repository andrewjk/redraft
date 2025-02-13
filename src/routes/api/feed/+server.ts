import feedList from "@/lib/feed/feedList";
import getErrorMessage from "@/lib/utils/getErrorMessage";
import type { ServerEndPoint } from "@torpor/build";
import { ok, serverError } from "@torpor/build/response";

export default {
	get: async ({ url }) => {
		try {
			const query = Object.fromEntries(url.searchParams.entries());
			const limit = query.limit ? parseInt(query.limit) : undefined;
			const offset = query.offset ? parseInt(query.offset) : undefined;
			const liked = query.liked !== undefined ? true : undefined;
			const saved = query.saved !== undefined ? true : undefined;

			const posts = await feedList(limit, offset, liked, saved);

			return ok(posts);
		} catch (error) {
			const message = getErrorMessage(error).message;
			return serverError(message);
		}
	},
} satisfies ServerEndPoint;
