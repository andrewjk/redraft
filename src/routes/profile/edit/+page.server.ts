import * as api from "@/lib/api.js";
import { uploadFile } from "@/lib/storage";
import formDataToObject from "@/lib/utils/formDataToObject";
import setUserToken from "@/lib/utils/setUserToken";
import uuid from "@/lib/utils/uuid";
import { type PageServerEndPoint } from "@torpor/build";
import { ok, seeOther, unauthorized, unprocessable } from "@torpor/build/response";

export default {
	load: async ({ appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		const result = await api.get("profile/edit", user.token);
		if (result.errors) {
			return unprocessable(result);
		}

		return ok({ profile: result });
	},
	actions: {
		default: async ({ appData, cookies, request }) => {
			const user = appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const model = formDataToObject(data);

			// Save the image if it's been uploaded
			model.imagefile = data.get("imagefile");
			if (model.imagefile?.name) {
				let name = uuid() + "." + model.imagefile.name.split(".").at(-1);
				//const url = `${process.env.URL}api/storage`;
				//let upload = new FormData();
				//upload.set("file", model.imagefile);
				//upload.set("name", name);
				//await fetch(url, { method: "POST", body: upload });
				await uploadFile(model.imagefile, name);
				model.image = `${user.url}api/content/${name}`;
			}

			const result = await api.post("profile/edit", model, user.token);
			if (result.errors) {
				return unprocessable(result);
			}

			setUserToken(cookies, {
				url: result.url,
				name: result.name,
				image: result.image,
				token: user.token,
			});

			return seeOther("/profile");
		},
	},
} satisfies PageServerEndPoint;
