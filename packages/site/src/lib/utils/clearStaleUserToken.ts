import { CookieHelper } from "@torpor/build/server";
import userIdQuery from "./userIdQuery";

/**
 * Checks that the logged in user's token still exists in the database, and
 * deletes the cookie and clears the user if it doesn't. This can happen when
 * the database is recreated, or when a token has expired or been revoked.
 * Without this check the user gets bounced between the setup/login page and
 * the feed page, because the cookie still passes JWT verification.
 */
export default async function clearStaleUserToken(
	appData: Record<string, any>,
	cookies: CookieHelper,
) {
	const user = appData.user;
	if (!user) {
		return;
	}

	// The token code is checked against the database, and expires with it
	const records = await userIdQuery(user.code);
	if (records.length > 0) {
		return;
	}

	cookies.delete("jwt", { path: "/" });
	appData.user = null;
}
