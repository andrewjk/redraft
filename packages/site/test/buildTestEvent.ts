import { ServerEvent } from "@torpor/build/server";
import createUserToken from "../src/lib/utils/createUserToken";
import setUserToken from "../src/lib/utils/setUserToken";

export default async function buildTestEvent(path: string, code: string): Promise<ServerEvent> {
	let ev = new ServerEvent(new Request(path));
	const user = {
		url: "",
		username: "",
		name: "",
		image: "",
		token: "",
		code,
	};
	user.token = await createUserToken(user, user.code);
	setUserToken(ev.cookies, user);
	return ev;
}
