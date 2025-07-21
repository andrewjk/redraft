import { ServerLoadEvent } from "@torpor/build";
import { unauthorized } from "@torpor/build/response";
import * as api from "../../../lib/api";
import formDataToObject from "../../../lib/utils/formDataToObject";
import postsPin from "../../api/posts/pin/+server";

export default async function ({ appData, request, params }: ServerLoadEvent) {
	const user = appData.user;
	if (!user) {
		return unauthorized();
	}

	const data = await request.formData();
	const model = formDataToObject(data);

	return await api.post(`posts/pin`, postsPin, params, model, user.token);
}
