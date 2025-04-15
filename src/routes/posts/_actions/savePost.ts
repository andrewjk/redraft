import * as api from "@/lib/api";
import { uploadFile } from "@/lib/storage";
import formDataToObject from "@/lib/utils/formDataToObject";
import uuid from "@/lib/utils/uuid";
import { type ServerLoadEvent } from "@torpor/build";
import { redirect, unauthorized, unprocessable } from "@torpor/build/response";

export default async function savePost({ appData, request, params }: ServerLoadEvent) {
	const user = appData.user;
	if (!user) {
		return unauthorized();
	}

	const data = await request.formData();
	const model = formDataToObject(data);

	// Save the image if it's been uploaded
	const imagefile = data.get("imagefile") as File;
	if (imagefile?.name) {
		let name = uuid() + "." + imagefile.name.split(".").at(-1);
		await uploadFile(imagefile, name);
		model.image = `${user.url}api/content/${name}`;
	}

	const result = await api.post(`posts/save`, params, model, user.token);
	if (result.errors) {
		return unprocessable(result);
	}

	return redirect("/posts/drafts");
}
