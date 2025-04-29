import type { ServerEndPoint } from "@torpor/build";
import tagList from "../../../lib/tags/tagList";

export default {
	get: async ({ url }) => {
		const query = Object.fromEntries(url.searchParams.entries());
		const limit = query.limit ? parseInt(query.limit) : undefined;
		const offset = query.offset ? parseInt(query.offset) : undefined;

		return await tagList(limit, offset);
	},
} satisfies ServerEndPoint;
