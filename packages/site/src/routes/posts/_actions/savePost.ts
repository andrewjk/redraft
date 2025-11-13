import { type ServerLoadEvent } from "@torpor/build";
import { seeOther, unauthorized } from "@torpor/build/response";
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
	if (imagefile?.name) {
		let name = uuid() + "." + imagefile.name.split(".").at(-1);
		await store.uploadFile(imagefile, name);
		model.image = `${user.url}api/content/${name}`;
		model.imagefile = undefined;
	}

	// Save the link image if it's been uploaded
	const linkimagefile = data.get("linkimagefile") as File;
	if (linkimagefile?.name) {
		let name = uuid() + "." + linkimagefile.name.split(".").at(-1);
		await store.uploadFile(linkimagefile, name);
		model.linkImage = `${user.url}api/content/${name}`;
		model.linkimagefile = undefined;
	}

	const result = await api.post(`posts/save`, postsSave, params, model, user.token);
	if (!result.ok) {
		return result;
	}

	let url = "/";
	if (params.user) url += params.user + "/";
	url += "posts";
	if (!published) url += "/drafts";

	return seeOther(url);
}
