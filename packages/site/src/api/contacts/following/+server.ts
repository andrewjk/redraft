import type { ServerEndPoint } from "@torpor/build";
import followingList from "../../../lib/contacts/followingList";

export default {
	get: async ({ appData, url }) => {
		const user = appData.user;
		//if (!user) {
		//	return unauthorized();
		//}

		const query = Object.fromEntries(url.searchParams.entries());
		const limit = query.limit ? parseInt(query.limit) : undefined;
		const offset = query.offset ? parseInt(query.offset) : undefined;

		return await followingList(user?.code, limit, offset);
	},
} satisfies ServerEndPoint;
