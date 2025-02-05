import * as api from "@/lib/api.js";
import formDataToObject from "@/lib/utils/formDataToObject";
import setUserToken from "@/lib/utils/setUserToken";
import { type PageServerEndPoint } from "@torpor/build";
import { redirect, seeOther, unprocessable } from "@torpor/build/response";

export default {
	load: async ({ appData }) => {
		const user = appData.user;
		if (user) {
			return redirect("/");
		}
	},
	actions: {
		default: async ({ cookies, request }) => {
			const data = await request.formData();
			const model = formDataToObject(data);

			const result = await api.post("account/login", model);
			if (result.errors) {
				return unprocessable(result);
			}

			setUserToken(cookies, {
				email: result.email,
				token: result.token,
				username: result.username,
				name: result.name,
				image: result.image,
			});

			return seeOther("/");
		},
	},
} satisfies PageServerEndPoint;
