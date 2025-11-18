import { type ServerLoadEvent } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import feedLike from "../../../api/feed/like/+server";
import * as api from "../../../lib/api";
import formDataToObject from "../../../lib/utils/formDataToObject";

export default async function likeFeedPost({ appData, request, params }: ServerLoadEvent) {
	const user = appData.user;
	if (!user) {
		return unauthorized();
	}

	const data = await request.formData();
	const model = formDataToObject(data);

	return await api.post(`feed/like`, feedLike, params, model, user.token);
}
