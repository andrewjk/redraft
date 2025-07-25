import type { ServerEndPoint } from "@torpor/build";
import { seeOther, unauthorized } from "@torpor/build/response";
import listsGet from "../../../../../../lib/contacts/listsGet";
import listsSave from "../../../../../../lib/contacts/listsSave";

export default {
	get: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await listsGet(params.slug, user.code);
	},
	post: async ({ request, appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		const result = await listsSave(request, user.code);
		if (!result.ok) {
			return result;
		}

		return seeOther(params.user ? `/${params.user}/contacts/lists` : "/contacts/lists");
	},
} satisfies ServerEndPoint;
