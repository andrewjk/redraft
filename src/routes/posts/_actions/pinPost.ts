import * as api from "@/lib/api";
import formDataToObject from "@/lib/utils/formDataToObject";
import { ServerEvent } from "@torpor/build";
import { unauthorized, unprocessable } from "@torpor/build/response";

export default async function ({ appData, request }: ServerEvent) {
	const user = appData.user;
	if (!user) {
		return unauthorized();
	}

	const data = await request.formData();
	const model = formDataToObject(data);

	const result = await api.post(`posts/pin`, model, user.token);
	if (result.errors) {
		return unprocessable(result);
	}
}
