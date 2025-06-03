import { type ServerLoadEvent } from "@torpor/build";
import { seeOther, unauthorized, unprocessable } from "@torpor/build/response";
import * as api from "../../../lib/api";
import storage from "../../../lib/storage";
import formDataToObject from "../../../lib/utils/formDataToObject";
import uuid from "../../../lib/utils/uuid";
import postsPublish from "../../api/posts/publish/+server";

export default async function publishPost({ appData, request, params }: ServerLoadEvent) {
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
		let name = uuid() + "." + imagefile.name.split(".").at(-1);
		await store.uploadFile(imagefile, name);
		model.image = `${user.url}api/content/${name}`;
	}

	const result = await api.post(`posts/publish`, postsPublish, params, model, user.token);
	if (result.errors) {
		return unprocessable(result);
	}

	return seeOther(params.user ? `/${params.user}/posts` : "/posts");
}
