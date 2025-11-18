import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import messageGroupGet from "../../../../lib/messages/messageGroupGet";
import messageGroupPost from "../../../../lib/messages/messageGroupPost";

export default {
	get: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await messageGroupGet(params.slug, user.code);
	},
	post: async ({ request, appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await messageGroupPost(request, user.code);
	},
} satisfies ServerEndPoint;
