import { type ServerLoadEvent } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import * as api from "../../../lib/api";
import formDataToObject from "../../../lib/utils/formDataToObject";
import commentsCreate from "../../api/comments/create/+server";

export default async function createComment({ appData, request, params }: ServerLoadEvent) {
	// Comments can be made by a following user, or by the main user
	const user = appData.follower || appData.user;
	if (!user) {
		return unauthorized();
	}

	const data = await request.formData();
	const model = formDataToObject(data);

	return await api.post(`comments/create`, commentsCreate, params, model, user.token);
}
