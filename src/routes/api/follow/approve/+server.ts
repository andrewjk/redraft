import followApprove from "@/lib/follow/followApprove";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	post: ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return followApprove(request, user.username);
	},
} satisfies ServerEndPoint;
