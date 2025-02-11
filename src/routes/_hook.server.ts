import type { ServerHook } from "@torpor/build";

export default {
	handle: ({ appData, cookies }) => {
		// Decode the user token, if it exists
		const jwt = cookies.get("jwt");
		try {
			appData.user = jwt ? JSON.parse(atob(jwt)) : null;
		} catch {
			// Just delete the cookie if it has some bad data in it, and then
			// the user can log back in
			cookies.delete("jwt", { path: "/" });
		}

		// Decode the follower token, if it exists
		const fjwt = cookies.get("fjwt");
		try {
			appData.fuser = fjwt ? JSON.parse(atob(fjwt)) : null;
		} catch {
			cookies.delete("fjwt", { path: "/" });
		}
	},
} satisfies ServerHook;
