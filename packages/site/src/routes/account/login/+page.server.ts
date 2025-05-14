import { type PageServerEndPoint } from "@torpor/build";
import { seeOther, unprocessable } from "@torpor/build/response";
import * as api from "../../../lib/api";
import formDataToObject from "../../../lib/utils/formDataToObject";
import setUserToken from "../../../lib/utils/setUserToken";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		if (user) {
			return seeOther(params.user ? `/${params.user}/feed` : "/feed");
		}
	},
	actions: {
		default: async ({ request, params, cookies }) => {
			const data = await request.formData();
			const model = formDataToObject(data);

			const result = await api.post("account/login", params, model);
			if (result.errors) {
				return unprocessable(result);
			}

			setUserToken(cookies, {
				url: result.url,
				username: result.username,
				name: result.name,
				image: result.image,
				token: result.token,
				code: result.code,
			});

			return seeOther(params.user ? `/${params.user}/feed` : "/feed");
		},
	},
} satisfies PageServerEndPoint;
