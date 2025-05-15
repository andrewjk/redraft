import { type PageServerEndPoint } from "@torpor/build";
import { ok, unauthorized, unprocessable } from "@torpor/build/response";
import * as api from "../../lib/api";
import formDataToObject from "../../lib/utils/formDataToObject";
import setUserToken from "../../lib/utils/setUserToken";
import logout from "../account/_actions/logout";

export default {
	load: async ({ params }) => {
		const result = await api.get("profile", params);
		if (result.errors) {
			return unprocessable(result);
		}

		return ok({ profile: result });
	},
	actions: {
		logout,
		save: async ({ appData, cookies, request, params }) => {
			const user = appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const model = formDataToObject(data);

			const result = await api.post("profile/edit", params, model, user.token);
			if (result.errors) {
				return unprocessable(result);
			}

			setUserToken(cookies, {
				url: result.url,
				username: user.username,
				name: result.name,
				image: result.image,
				token: user.token,
				code: user.code,
			});

			appData.user = result;
		},
	},
} satisfies PageServerEndPoint;
