import { type PageServerEndPoint } from "@torpor/build";
import { seeOther, unprocessable } from "@torpor/build/response";
import * as api from "../../../lib/api";
import env from "../../../lib/env";
import storage from "../../../lib/storage";
import ensureSlash from "../../../lib/utils/ensureSlash";
import formDataToObject from "../../../lib/utils/formDataToObject";
import setUserToken from "../../../lib/utils/setUserToken";
import uuid from "../../../lib/utils/uuid";
import accountSetup from "../../../routes/api/account/setup/+server";

export default {
	load: async ({ appData, params }) => {
		const user = appData.user;
		if (user) {
			return seeOther(params.user ? `/${params.user}/feed` : "/feed");
		}
	},
	actions: {
		default: async ({ request, params, cookies }) => {
			const store = storage();

			const data = await request.formData();
			const model = formDataToObject(data);

			// Save the image if it's been uploaded
			const imagefile = data.get("imagefile") as File;
			if (imagefile?.name) {
				let name = uuid() + "." + imagefile.name.split(".").at(-1);
				await store.uploadFile(imagefile, name);
				model.image = `${ensureSlash(env().SITE_LOCATION)}api/content/${name}`;
			}

			const result = await api.post("account/setup", accountSetup, params, model);
			if (result.errors) {
				return unprocessable(result);
			}

			setUserToken(cookies, {
				url: result.url,
				username: result.username,
				name: result.name,
				image: result.image,
				token: result.token,
				code: result.code,
			});

			return seeOther(params.user ? `/${params.user}/feed` : "/feed");
		},
	},
} satisfies PageServerEndPoint;
