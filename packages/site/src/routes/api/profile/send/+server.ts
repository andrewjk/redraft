import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import profileSend from "../../../../lib/profile/profileSend";

export default {
	post: async ({ appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await profileSend(user.code);
	},
} satisfies ServerEndPoint;
