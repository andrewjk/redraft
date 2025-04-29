import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import followSend from "../../../lib/follow/followSend";

export default {
	post: async ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await followSend(request, user.code);
	},
} satisfies ServerEndPoint;
