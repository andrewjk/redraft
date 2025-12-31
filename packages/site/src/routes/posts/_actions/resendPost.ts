import { type ServerLoadEvent } from "@torpor/build";
import { seeOther, unauthorized } from "@torpor/build/response";
import postResend from "../../../api/posts/resend/+server";
import * as api from "../../../lib/api";
import formDataToObject from "../../../lib/utils/formDataToObject";

export default async function resendPost({ appData, request, params }: ServerLoadEvent) {
	const user = appData.user;
	if (!user) {
		return unauthorized();
	}

	const data = await request.formData();
	const model = formDataToObject(data);

	const result = await api.post(`posts/resend`, postResend, params, model, user.token);
	if (!result.ok) {
		return result;
	}

	return seeOther(params.user ? `/${params.user}/posts` : "/posts");
}
