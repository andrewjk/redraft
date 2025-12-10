import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import followRemove from "../../../lib/follow/followRemove";

export default {
	post: async ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await followRemove(request, user.code);
	},
} satisfies ServerEndPoint;
