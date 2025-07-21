import { type ServerLoadEvent } from "@torpor/build";
import { seeOther, unauthorized } from "@torpor/build/response";
import * as api from "../../../lib/api";
import accountLogout from "../../api/account/logout/+server";

export default async function logout({ appData, cookies, params }: ServerLoadEvent) {
	const user = appData.user;
	if (!user) {
		return unauthorized();
	}

	const result = await api.post("account/logout", accountLogout, params, null, user.token);
	if (!result.ok) {
		return result;
	}

	cookies.delete("jwt", { path: "/" });
	appData.user = null;
	return seeOther("/");
}
