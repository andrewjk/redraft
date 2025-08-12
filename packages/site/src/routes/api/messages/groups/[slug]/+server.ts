import type { ServerEndPoint } from "@torpor/build";
import { seeOther, unauthorized } from "@torpor/build/response";
import messageGroupGet from "../../../../../lib/messages/messageGroupGet";
import messageGroupPost from "../../../../../lib/messages/messageGroupPost";

export default {
	get: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await messageGroupGet(params.slug, user.code);
	},
	post: async ({ request, appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		const result = await messageGroupPost(request, user.code);
		if (!result.ok) {
			return result;
		}

		return seeOther(
			params.user
				? `/${params.user}/messages/groups/${params.slug}`
				: `/messages/groups/${params.slug}`,
		);
	},
} satisfies ServerEndPoint;
