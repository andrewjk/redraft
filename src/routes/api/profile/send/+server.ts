import profileSend from "@/lib/profile/profileSend";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	post: async ({ appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await profileSend();
	},
} satisfies ServerEndPoint;
