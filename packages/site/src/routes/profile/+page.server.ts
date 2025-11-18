import { type PageServerEndPoint } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import profileGet from "../../api/profile/+server";
import profileEdit from "../../api/profile/edit/+server";
import * as api from "../../lib/api";
import storage from "../../lib/storage";
import formDataToObject from "../../lib/utils/formDataToObject";
import setUserToken from "../../lib/utils/setUserToken";
import uuid from "../../lib/utils/uuid";
import type ProfileEditedModel from "../../types/profile/ProfileEditedModel";
import logout from "../account/_actions/logout";

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
			if (!result.ok) {
				return result;
			}
			const newUser: ProfileEditedModel = await result.json();

			setUserToken(cookies, {
				url: newUser.url,
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
