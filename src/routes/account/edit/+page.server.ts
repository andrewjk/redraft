import * as api from "@/lib/api.js";
import { uploadFile } from "@/lib/storage";
import formDataToObject from "@/lib/utils/formDataToObject";
import setUserToken from "@/lib/utils/setUserToken";
import { type PageServerEndPoint } from "@torpor/build";
import { ok, seeOther, unauthorized, unprocessable } from "@torpor/build/response";
import { v4 as uuid } from "uuid";

export default {
	load: async ({ appData }) => {
		const user = appData.user;
		if (!user) {
			return unauthorized();
		}

		const result = await api.get("account", user.token);
		if (result.errors) {
			return unprocessable(result);
		}

		return ok({ account: result });
	},
	actions: {
		default: async ({ appData, cookies, request }) => {
			const user = appData.user;
			if (!user) {
				return unauthorized();
			}

			const data = await request.formData();
			const model = formDataToObject(data);
			model.imagefile = data.get("imagefile");

			// Save the image if it's been uploaded
			if (model.imagefile) {
				let name = uuid() + "." + model.imagefile.name.split(".").at(-1);
				//const url = "http://localhost:7059/api/storage";
				//let upload = new FormData();
				//upload.set("file", model.imagefile);
				//upload.set("name", name);
				//await fetch(url, { method: "POST", body: upload });
				await uploadFile(model.imagefile, name);
				model.image = "/api/content/" + name;
			}

			const result = await api.post("account/edit", model, user.token);
			if (result.errors) {
				return unprocessable(result);
			}

			setUserToken(cookies, {
				email: result.email,
				token: user.token,
				username: result.username,
				name: result.name,
				image: result.image,
			});

			return seeOther("/account");
		},
	},
} satisfies PageServerEndPoint;
