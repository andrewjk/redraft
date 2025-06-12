import { type ServerLoadEvent } from "@torpor/build";
import { seeOther, unauthorized, unprocessable } from "@torpor/build/response";
import * as api from "../../../lib/api";
import storage from "../../../lib/storage";
import formDataToObject from "../../../lib/utils/formDataToObject";
import uuid from "../../../lib/utils/uuid";
import postsSave from "../../api/posts/save/+server";

export default async function savePost({ appData, request, params }: ServerLoadEvent) {
	const user = appData.user;
	if (!user) {
		return unauthorized();
	}

	const store = storage();

	const data = await request.formData();
	const model = formDataToObject(data);

	// Save the image if it's been uploaded
	const imagefile = data.get("imagefile") as File;
	console.log("IMAGE FILE", imagefile);
	if (imagefile?.name) {
		let name = uuid() + "." + imagefile.name.split(".").at(-1);
		await store.uploadFile(imagefile, name);
		model.image = `${user.url}api/content/${name}`;
	}

	const result = await api.post(`posts/save`, postsSave, params, model, user.token);
	if (result.errors) {
		return unprocessable(result);
	}

	return seeOther(params.user ? `/${params.user}/posts/drafts` : "/posts/drafts");
}
