import * as api from "@/lib/api";
import { type ServerLoadEvent } from "@torpor/build";
import { seeOther, unauthorized, unprocessable } from "@torpor/build/response";

export default async function logout({ appData, cookies, params }: ServerLoadEvent) {
	const user = appData.user;
	if (!user) {
		return unauthorized();
	}

	const result = await api.post("account/logout", params, null, user.token);
	if (result.errors) {
		return unprocessable(result);
	}

	cookies.delete("jwt", { path: "/" });
	appData.user = null;
	return seeOther("/");
}
