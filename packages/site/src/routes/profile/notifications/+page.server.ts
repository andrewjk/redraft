import { type PageServerEndPoint } from "@torpor/build";
import { ok, unauthorized, unprocessable } from "@torpor/build/response";
import * as api from "../../../lib/api";
import profileNotifications from "../../api/profile/notifications/+server";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		const result = await api.get("profile/notifications", profileNotifications, params, user.token);
		if (result.errors) {
			return unprocessable(result);
		}

		return ok(result);
	},
} satisfies PageServerEndPoint;
