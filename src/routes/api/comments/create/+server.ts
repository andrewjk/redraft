import commentCreate from "@/lib/comments/commentCreate";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	post: ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return commentCreate(request, user.username, user.token);
	},
} satisfies ServerEndPoint;
