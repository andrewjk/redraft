import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import messageCreateGet from "../../../../../lib/messages/messageCreateGet";
import messageCreatePost from "../../../../../lib/messages/messageCreatePost";

export default {
	get: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await messageCreateGet(params.slug, user.code);
	},
	post: async ({ request, appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await messageCreatePost(request, user.code);
	},
} satisfies ServerEndPoint;
