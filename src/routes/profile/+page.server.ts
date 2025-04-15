import * as api from "@/lib/api.js";
import formDataToObject from "@/lib/utils/formDataToObject";
import setUserToken from "@/lib/utils/setUserToken";
import { type PageServerEndPoint } from "@torpor/build";
import { ok, redirect, unauthorized, unprocessable } from "@torpor/build/response";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return redirect("/account/login");
		}

		const result = await api.get("profile", params, user.token);
		if (result.errors) {
			return unprocessable(result);
		}

		return ok({ profile: result });
	},
	actions: {
		logout: ({ appData, cookies }) => {
			cookies.delete("jwt", { path: "/" });
			appData.user = null;
			return redirect("/");
		},
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
				name: result.name,
				image: result.image,
				token: user.token,
				code: user.code,
			});

			appData.user = result;
		},
	},
} satisfies PageServerEndPoint;
