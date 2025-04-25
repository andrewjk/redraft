import accountLogout from "@/lib/account/accountLogout";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	post: async ({ appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await accountLogout(user.code);
	},
} satisfies ServerEndPoint;
