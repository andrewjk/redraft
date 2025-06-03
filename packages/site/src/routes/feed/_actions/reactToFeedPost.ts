import { type ServerLoadEvent } from "@torpor/build";
import { unauthorized, unprocessable } from "@torpor/build/response";
import * as api from "../../../lib/api";
import formDataToObject from "../../../lib/utils/formDataToObject";
import feedReact from "../../api/feed/react/+server";

export default async function reactToFeedPost({ appData, request, params }: ServerLoadEvent) {
	const user = appData.user;
	if (!user) {
		return unauthorized();
	}

	const data = await request.formData();
	const model = formDataToObject(data);

	const result = await api.post(`feed/react`, feedReact, params, model, user.token);
	if (result.errors) {
		return unprocessable(result);
	}
}
