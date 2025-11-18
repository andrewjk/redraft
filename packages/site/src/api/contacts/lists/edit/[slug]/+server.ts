import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
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
	post: async ({ request, appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await listSave(request, user.code);
	},
} satisfies ServerEndPoint;
