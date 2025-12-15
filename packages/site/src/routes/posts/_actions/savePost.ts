import { type ServerLoadEvent } from "@torpor/build";
import { seeOther, unauthorized } from "@torpor/build/response";
import postsSave from "../../../api/posts/save/+server";
import * as api from "../../../lib/api";
import storage from "../../../lib/storage";
import formDataToObject from "../../../lib/utils/formDataToObject";
import uuid from "../../../lib/utils/uuid";
import type PostEditModel from "../../../types/posts/PostEditModel";

export default async function savePost({ appData, request, params }: ServerLoadEvent) {
	const user = appData.user;
	if (!user) {
		return unauthorized();
	}

	const store = storage();

	const data = await request.formData();
	const model = formDataToObject(data) as PostEditModel;

	// Save the image if it's been uploaded
	const imagefile = data.get("imagefile") as File;
	if (imagefile?.name) {
		if (model.image) {
			await store.deleteFile(model.image);
		}
		let name = uuid() + "." + imagefile.name.split(".").at(-1);
		await store.uploadFile(imagefile, name);
		model.image = `${user.url}api/content/${name}`;
	}
	model.imagefile = undefined;

	// Save the link image if it's been uploaded
	const linkimagefile = data.get("linkimagefile") as File;
	if (linkimagefile?.name) {
		if (model.linkImage) {
			await store.deleteFile(model.linkImage);
		}
		let name = uuid() + "." + linkimagefile.name.split(".").at(-1);
		await store.uploadFile(linkimagefile, name);
		model.linkImage = `${user.url}api/content/${name}`;
	}
	model.linkimagefile = undefined;

	// And for children
	if (model.children?.length) {
		let childIndex = 0;
		for (let child of model.children) {
			const imagefile = data.get(`children[${childIndex}]imagefile`) as File;
			if (imagefile?.name) {
				if (child.image) {
					await store.deleteFile(child.image);
				}
				let name = uuid() + "." + imagefile.name.split(".").at(-1);
				await store.uploadFile(imagefile, name);
				child.image = `${user.url}api/content/${name}`;
			}
			child.imagefile = undefined;

			const linkimagefile = data.get(`children[${childIndex}]linkimagefile`) as File;
			if (linkimagefile?.name) {
				if (child.linkImage) {
					await store.deleteFile(child.linkImage);
				}
				let name = uuid() + "." + linkimagefile.name.split(".").at(-1);
				await store.uploadFile(linkimagefile, name);
				child.linkImage = `${user.url}api/content/${name}`;
			}
			child.linkimagefile = undefined;

			childIndex++;
		}
	}

	let published = data.get("published");

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
