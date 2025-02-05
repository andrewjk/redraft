import * as api from "@/lib/api.js";
import formDataToObject from "@/lib/utils/formDataToObject";
import setUserToken from "@/lib/utils/setUserToken";
import { type PageServerEndPoint } from "@torpor/build";
import { ok, seeOther, unauthorized, unprocessable } from "@torpor/build/response";

export default {
	load: async ({ appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		const result = await api.get("account", user.token);
		if (result.errors) {
			return unprocessable(result);
		}

		return ok({ account: result });
	},
	actions: {
		default: async ({ appData, cookies, request }) => {
			const user = appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const model = formDataToObject(data);

			const result = await api.post("account/edit", model, user.token);
			if (result.errors) {
				return unprocessable(result);
			}

			setUserToken(cookies, {
				email: result.email,
				token: user.token,
				username: result.username,
				name: result.name,
				image: result.image,
			});

			return seeOther("/account");
		},
	},
} satisfies PageServerEndPoint;
