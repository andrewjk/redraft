import type { ServerEndPoint } from "@torpor/build";
import { seeOther, unauthorized } from "@torpor/build/response";
import listsGetNew from "../../../../../lib/contacts/listsGetNew";
import listsSaveNew from "../../../../../lib/contacts/listsSaveNew";

export default {
	get: async ({ appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await listsGetNew(user.code);
	},
	post: async ({ request, appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		const result = await listsSaveNew(request, user.code);
		if (!result.ok) {
			return result;
		}

		return seeOther(params.user ? `/${params.user}/contacts/lists` : "/contacts/lists");
	},
} satisfies ServerEndPoint;
