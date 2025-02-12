import profileSend from "@/lib/profile/profileSend";
import type { ServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";

export default {
	post: ({ appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return profileSend();
	},
} satisfies ServerEndPoint;
