import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import accountExport from "../../../lib/account/accountExport";

export default {
	post: async ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await accountExport(request, user.code);
	},
} satisfies ServerEndPoint;
