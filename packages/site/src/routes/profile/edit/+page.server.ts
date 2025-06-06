import { type PageServerEndPoint } from "@torpor/build";
import { ok, seeOther, unauthorized, unprocessable } from "@torpor/build/response";
import * as api from "../../../lib/api";
import storage from "../../../lib/storage";
import formDataToObject from "../../../lib/utils/formDataToObject";
import setUserToken from "../../../lib/utils/setUserToken";
import uuid from "../../../lib/utils/uuid";
import profileEdit from "../../api/profile/edit/+server";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		const result = await api.get("profile/edit", profileEdit, params, user.token);
		if (result.errors) {
			return unprocessable(result);
		}

		return ok({ profile: result });
	},
	actions: {
		default: async ({ appData, cookies, request, params }) => {
			const user = appData.user;
			if (!user) {
				return unauthorized();
			}

			const store = storage();

			const data = await request.formData();
			const model = formDataToObject(data);

			// Save the image if it's been uploaded
			const imagefile = data.get("imagefile") as File;
			if (imagefile?.name) {
				if (user.image) {
					await store.deleteFile(user.image);
				}
				let name = uuid() + "." + imagefile.name.split(".").at(-1);
				await store.uploadFile(imagefile, name);
				model.image = `${user.url}api/content/${name}`;
			}

			const result = await api.post("profile/edit", profileEdit, params, model, user.token);
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

			return seeOther(params.user ? `/${params.user}/profile` : "/profile");
		},
	},
} satisfies PageServerEndPoint;
