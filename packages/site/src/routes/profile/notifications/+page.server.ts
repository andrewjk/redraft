import { type PageServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import * as api from "../../../lib/api";
import profileNotifications from "../../api/profile/notifications/+server";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		return await api.get("profile/notifications", profileNotifications, params, user.token);
	},
} satisfies PageServerEndPoint;
