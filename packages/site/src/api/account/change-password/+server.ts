import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import accountChangePassword from "../../../lib/account/accountChangePassword";

export default {
	post: async ({ appData, request }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await accountChangePassword(request, user.code);
	},
} satisfies ServerEndPoint;
