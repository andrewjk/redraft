import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import followApprove from "../../../../lib/follow/followApprove";

export default {
	post: async ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await followApprove(request, user.code);
	},
} satisfies ServerEndPoint;
