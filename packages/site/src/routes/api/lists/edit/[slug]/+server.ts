import type { ServerEndPoint } from "@torpor/build";
import { seeOther, unauthorized } from "@torpor/build/response";
import listGet from "../../../../../lib/contacts/listGet";
import listSave from "../../../../../lib/contacts/listSave";

export default {
	get: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await listGet(params.slug, user.code);
	},
	post: async ({ request, appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		const result = await listSave(request, user.code);
		if (!result.ok) {
			return result;
		}

		return seeOther(params.user ? `/${params.user}/contacts/lists` : "/contacts/lists");
	},
} satisfies ServerEndPoint;
