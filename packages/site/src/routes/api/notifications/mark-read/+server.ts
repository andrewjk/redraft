import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import notificationMarkRead from "../../../../lib/notifications/notificationMarkRead";

export default {
	post: async ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await notificationMarkRead(request, user.code);
	},
} satisfies ServerEndPoint;
