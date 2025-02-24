import articleList from "@/lib/articles/articleList";
import getErrorMessage from "@/lib/utils/getErrorMessage";
import type { ServerEndPoint } from "@torpor/build";
import { ok, serverError } from "@torpor/build/response";

export default {
	get: async ({ url }) => {
		try {
			const query = Object.fromEntries(url.searchParams.entries());
			const limit = query.limit ? parseInt(query.limit) : undefined;
			const offset = query.offset ? parseInt(query.offset) : undefined;

			const articles = await articleList(true, limit, offset);

			return ok(articles);
		} catch (error) {
			const message = getErrorMessage(error).message;
			return serverError(message);
		}
	},
} satisfies ServerEndPoint;
