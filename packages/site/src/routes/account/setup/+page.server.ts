import { type PageServerEndPoint } from "@torpor/build";
import { seeOther } from "@torpor/build/response";
import accountSetup from "../../..//api/account/setup/+server";
import * as api from "../../../lib/api";
import env from "../../../lib/env";
import storage from "../../../lib/storage";
import ensureSlash from "../../../lib/utils/ensureSlash";
import formDataToObject from "../../../lib/utils/formDataToObject";
import setUserToken from "../../../lib/utils/setUserToken";
import uuid from "../../../lib/utils/uuid";

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
			model.imagefile = undefined;

			const result = await api.post("account/setup", accountSetup, params, model);
			if (!result.ok) {
				return result;
			}
			const user = await result.json();

			setUserToken(cookies, {
				url: user.url,
				username: user.username,
				name: user.name,
				image: user.image,
				token: user.token,
				code: user.code,
			});

			return seeOther(params.user ? `/${params.user}/feed` : "/feed");
		},
	},
} satisfies PageServerEndPoint;
