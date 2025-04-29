import { type ServerLoadEvent } from "@torpor/build";
import { unauthorized, unprocessable } from "@torpor/build/response";
import * as api from "../../../lib/api";
import formDataToObject from "../../../lib/utils/formDataToObject";

export default async function createComment({ appData, request, params }: ServerLoadEvent) {
	// Comments can be made by a following user, or by the main user
	const user = appData.follower || appData.user;
	if (!user) {
		return unauthorized();
	}

	const data = await request.formData();
	const model = formDataToObject(data);

	const result = await api.post(`comments/create`, params, model, user.token);
	if (result.errors) {
		return unprocessable(result);
	}
}
