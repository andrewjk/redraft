import { type PageServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import * as api from "../../lib/api";
import formDataToObject from "../../lib/utils/formDataToObject";
import setUserToken from "../../lib/utils/setUserToken";
import logout from "../account/_actions/logout";
import profileGet from "../api/profile/+server";
import profileEdit from "../api/profile/edit/+server";

export default {
	load: async ({ params }) => {
		return await api.get("profile", profileGet, params);
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

			const result = await api.post("profile/edit", profileEdit, params, model, user.token);
			if (!result.ok) {
				return result;
			}
			const newUser = await result.json();

			setUserToken(cookies, {
				url: result.url,
				username: user.username,
				name: newUser.name,
				image: newUser.image,
				token: user.token,
				code: user.code,
			});

			appData.user = newUser;
		},
	},
} satisfies PageServerEndPoint;
