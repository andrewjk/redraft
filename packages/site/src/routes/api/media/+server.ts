import type { ServerEndPoint } from "@torpor/build";
import mediaList from "../../../lib/media/mediaList";

export default {
	get: async ({ url }) => {
		const query = Object.fromEntries(url.searchParams.entries());
		const limit = query.limit ? parseInt(query.limit) : undefined;
		const offset = query.offset ? parseInt(query.offset) : undefined;

		return await mediaList(false, limit, offset);
	},
} satisfies ServerEndPoint;
