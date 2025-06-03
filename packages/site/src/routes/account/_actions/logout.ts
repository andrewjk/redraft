import { type ServerLoadEvent } from "@torpor/build";
import { seeOther, unauthorized, unprocessable } from "@torpor/build/response";
import * as api from "../../../lib/api";
import accountLogout from "../../api/account/logout/+server";

export default async function logout({ appData, cookies, params }: ServerLoadEvent) {
	const user = appData.user;
	if (!user) {
		return unauthorized();
	}

	const result = await api.post("account/logout", accountLogout, params, null, user.token);
	if (result.errors) {
		return unprocessable(result);
	}

	cookies.delete("jwt", { path: "/" });
	appData.user = null;
	return seeOther("/");
}
