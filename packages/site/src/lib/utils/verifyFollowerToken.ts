import * as jose from "jose";
import { and, eq, isNull } from "drizzle-orm";
import database from "../../data/database";
import { followedByTable } from "../../data/schema";

/**
 * Verifies a follower token. The token is signed by the follower's site with
 * the relationship's shared key, so we look up the relationship by the url in
 * the claims and verify the signature against its key.
 * @param token The token from the X-Social-Follower header
 * @returns the followed by record, or undefined if the token is invalid
 */
export default async function verifyFollowerToken(token: string) {
	try {
		// The claims are unverified at this point -- they only tell us which
		// relationship to check against
		const claims = jose.decodeJwt(token);
		const follower = claims.follower as { url?: string } | undefined;
		const url = follower?.url;
		if (!url) {
			return undefined;
		}

		const db = database();
		const record = await db.query.followedByTable.findFirst({
			where: and(eq(followedByTable.url, url), isNull(followedByTable.deleted_at)),
		});
		if (!record || !record.approved) {
			return undefined;
		}

		const secret = new TextEncoder().encode(record.shared_key);
		await jose.jwtVerify(token, secret);
		return record;
	} catch {
		return undefined;
	}
}
