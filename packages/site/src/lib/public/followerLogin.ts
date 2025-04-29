import { notFound, seeOther, serverError } from "@torpor/build/response";
import { CookieHelper } from "@torpor/build/server";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable } from "../../data/schema";
import createFollowerToken from "../utils/createFollowerToken";
import getErrorMessage from "../utils/getErrorMessage";
import setFollowerToken from "../utils/setFollowerToken";

//export type FollowerLoginModel = {
//	sharedKey: string;
//};

export default async function followerLogin(
	/*request: Request, */ sharedKey: string,
	cookies: CookieHelper,
) {
	try {
		const db = database();

		//const model: FollowerLoginModel = await request.json();

		const user = await db.query.followedByTable.findFirst({
			where: eq(followedByTable.shared_key, /*model.*/ sharedKey),
		});
		if (!user) {
			return notFound();
		}

		// Create the authentication token for future use
		const token = await createFollowerToken(user);

		// TODO: This should be done in the API call?
		setFollowerToken(cookies, {
			url: user.url,
			name: user.name,
			image: user.image,
			token: token,
		});

		return seeOther("/");
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
