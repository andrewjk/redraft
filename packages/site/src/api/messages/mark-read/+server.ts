import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import messageMarkRead from "../../../lib/messages/messageMarkRead";

export default {
	post: async ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await messageMarkRead(request, user.code);
	},
} satisfies ServerEndPoint;
