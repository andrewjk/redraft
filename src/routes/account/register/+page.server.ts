import * as api from "@/lib/api.js";
import formDataToObject from "@/lib/utils/formDataToObject";
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

			const result = await api.post("account/register", model);
			if (result.errors) {
				return unprocessable(result);
			}

			const value = btoa(JSON.stringify(result));
			cookies.set("jwt", value, { path: "/" });

			return seeOther("/");
		},
	},
} satisfies PageServerEndPoint;
