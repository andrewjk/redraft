import { type ServerLoadEvent } from "@torpor/build";
import { badRequest, seeOther, unauthorized } from "@torpor/build/response";
import postsSave from "../../../api/posts/save/+server";
import * as api from "../../../lib/api";
import { maxUploadSize } from "../../../lib/env";
import storage from "../../../lib/storage";
import formDataToObject from "../../../lib/utils/formDataToObject";
import isAllowedFileType from "../../../lib/utils/isAllowedFileType";
import { isImageFile } from "../../../lib/utils/isImageUrl";
import uploadName from "../../../lib/utils/uploadName";
import uuid from "../../../lib/utils/uuid";
import type PostEditModel from "../../../types/posts/PostEditModel";

export default async function savePost({ appData, request, params }: ServerLoadEvent) {
	const user = appData.user;
	if (!user) {
		return unauthorized();
	}

	const store = storage();

	const limit = maxUploadSize();
	const tooLarge = () =>
		badRequest({ message: `File is too large (max ${Math.floor(limit / (1024 * 1024))} MB)` });

	const data = await request.formData();
	const model = formDataToObject(data) as PostEditModel;

	// Save the attachment (an image or a file -- they share the image columns).
	// Files are stored with a name derived from the original (sanitised, plus a
	// random suffix) so re-uploading a same-named file won't overwrite an
	// earlier one.
	const imagefile = data.get("imagefile") as File;
	if (imagefile?.name) {
		if (imagefile.size > limit) {
			return tooLarge();
		}
		const isFile = !isImageFile(imagefile);
		if (isFile && !isAllowedFileType(imagefile.name)) {
			return badRequest({ message: "That file type isn't allowed" });
		}
		if (model.image) {
			await store.deleteFile(model.image);
		}
		const ext = (imagefile.name.split(".").at(-1) ?? "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
		const name = isFile ? uploadName(imagefile.name, "file-") : uuid() + (ext ? `.${ext}` : "");
		await store.uploadFile(imagefile, name);
		model.image = `${user.url}api/content/${name}`;
		if (isFile) {
			// Files reuse imageAltText to carry the original filename for display
			model.imageAltText = imagefile.name;
			model.isFile = true;
		}
	}
	model.imagefile = undefined;

	// Save the link image if it's been uploaded
	const linkimagefile = data.get("linkimagefile") as File;
	if (linkimagefile?.name) {
		if (linkimagefile.size > limit) {
			return tooLarge();
		}
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
				if (imagefile.size > limit) {
					return tooLarge();
				}
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
				if (linkimagefile.size > limit) {
					return tooLarge();
				}
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
