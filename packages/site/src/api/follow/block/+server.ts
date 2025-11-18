import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import followBlock from "../../../lib/follow/followBlock";

export default {
	post: async ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await followBlock(request, user.code);
	},
} satisfies ServerEndPoint;
