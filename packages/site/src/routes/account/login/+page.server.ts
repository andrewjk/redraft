import { type PageServerEndPoint } from "@torpor/build";
import { seeOther } from "@torpor/build/response";
import * as api from "../../../lib/api";
import formDataToObject from "../../../lib/utils/formDataToObject";
import setUserToken from "../../../lib/utils/setUserToken";
import accountLogin from "../../api/account/login/+server";

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

			const result = await api.post("account/login", accountLogin, params, model);
			if (!result.ok) {
				return result;
			}
			const user = await result.json();

			setUserToken(cookies, {
				url: user.url,
				username: user.username,
				name: user.name,
				image: user.image,
				token: user.token,
				code: user.code,
			});

			return seeOther(params.user ? `/${params.user}/feed` : "/feed");
		},
	},
} satisfies PageServerEndPoint;
