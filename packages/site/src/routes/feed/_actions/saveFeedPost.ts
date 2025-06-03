import { type ServerLoadEvent } from "@torpor/build";
import { unauthorized, unprocessable } from "@torpor/build/response";
import * as api from "../../../lib/api";
import formDataToObject from "../../../lib/utils/formDataToObject";
import feedSave from "../../api/feed/save/+server";

export default async function saveFeedPost({ appData, request, params }: ServerLoadEvent) {
	const user = appData.user;
	if (!user) {
		return unauthorized();
	}

	const data = await request.formData();
	const model = formDataToObject(data);

	const result = await api.post(`feed/save`, feedSave, params, model, user.token);
	if (result.errors) {
		return unprocessable(result);
	}
}
