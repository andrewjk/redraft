import { ServerEvent } from "@torpor/build/server";
import setUserToken from "../src/lib/utils/setUserToken";

export default async function buildTestEvent(path: string, code: string): Promise<ServerEvent> {
	let ev = new ServerEvent(new Request(path));
	const user = {
		url: "",
		username: "",
		name: "",
		image: "",
		code,
	};
	await setUserToken(ev.cookies, user);
	return ev;
}
