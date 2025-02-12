import accountSend from "@/lib/account/accountSend";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	post: ({ appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return accountSend();
	},
} satisfies ServerEndPoint;
