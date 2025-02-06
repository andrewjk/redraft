import followSend from "@/lib/follow/followSend";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	post: ({ appData, request, url }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return followSend(request, url, user.username);
	},
} satisfies ServerEndPoint;
