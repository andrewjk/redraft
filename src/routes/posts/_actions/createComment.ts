import * as api from "@/lib/api";
import formDataToObject from "@/lib/utils/formDataToObject";
import { type ServerEvent } from "@torpor/build";
import { unauthorized, unprocessable } from "@torpor/build/response";

export default async function createComment({ appData, request }: ServerEvent) {
	// Comments can be made by a following user, or by the main user
	const user = appData.follower || appData.user;
	if (!user) {
		return unauthorized();
	}

	const data = await request.formData();
	const model = formDataToObject(data);

	const result = await api.post(`comments/create`, model, user.token);
	if (result.errors) {
		return unprocessable(result);
	}
}
