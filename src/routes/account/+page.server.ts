import * as api from "@/lib/api.js";
import { type PageServerEndPoint } from "@torpor/build";
import { ok, redirect, unauthorized, unprocessable } from "@torpor/build/response";

export default {
	load: ({ appData }) => {
		const user = appData.user;
		if (!user) {
			return redirect("/account/login");
		}

		return ok({ profile: {} });
	},
	actions: {
		logout: ({ appData, cookies }) => {
			cookies.delete("jwt", { path: "/" });

			// TODO: Is this necessary?
			appData.user = null;
		},
		save: async ({ appData, cookies, request }) => {
			const exuser = appData.user;
			if (!exuser) {
				return unauthorized();
			}

			const data = await request.formData();

			const user = {
				username: data.get("username"),
				email: data.get("email"),
				password: data.get("password"),
				image: data.get("image"),
				bio: data.get("bio"),
			};

			const result = await api.put("user", { user }, exuser.token);
			if (result.errors) {
				return unprocessable(result);
			}

			const value = btoa(JSON.stringify(result.user));
			cookies.set("jwt", value, { path: "/" });

			// TODO: Is this necessary?
			appData.user = user;
		},
	},
} satisfies PageServerEndPoint;
