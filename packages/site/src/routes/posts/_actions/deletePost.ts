import { type ServerLoadEvent } from "@torpor/build";
import { seeOther, unauthorized } from "@torpor/build/response";
import postsDelete from "../../../api/posts/delete/+server";
import * as api from "../../../lib/api";
import formDataToObject from "../../../lib/utils/formDataToObject";
import type PostDeleteModel from "../../../types/posts/PostDeleteModel";

export default async function deletePost({ appData, request, params }: ServerLoadEvent) {
	const user = appData.user;
	if (!user) {
		return unauthorized();
	}

	const data = await request.formData();
	const model = formDataToObject(data) as PostDeleteModel;

	const result = await api.post(`posts/delete`, postsDelete, params, model, user.token);
	if (!result.ok) {
		return result;
	}

	let url = "/";
	if (params.user) url += params.user + "/";
	url += "posts";

	return seeOther(url);
}
