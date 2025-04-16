import * as api from "@/lib/api";
import env from "@/lib/env";
import { uploadFile } from "@/lib/storage";
import formDataToObject from "@/lib/utils/formDataToObject";
import setUserToken from "@/lib/utils/setUserToken";
import uuid from "@/lib/utils/uuid";
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
		default: async ({ request, params, cookies }) => {
			const data = await request.formData();
			const model = formDataToObject(data);

			// Save the image if it's been uploaded
			model.imagefile = data.get("imagefile");
			if (model.imagefile?.name) {
				let name = uuid() + "." + model.imagefile.name.split(".").at(-1);
				await uploadFile(model.imagefile, name);
				model.image = `${env().SITE_LOCATION}api/content/${name}`;
			}

			const result = await api.post("account/setup", params, model);
			if (result.errors) {
				return unprocessable(result);
			}

			setUserToken(cookies, {
				url: result.url,
				name: result.name,
				image: result.image,
				token: result.token,
			});

			return seeOther("/");
		},
	},
} satisfies PageServerEndPoint;
