import type { ServerHook } from "@torpor/build";

export default {
	handle: ({ appData, cookies }) => {
		const jwt = cookies.get("jwt");
		try {
			appData.user = jwt ? JSON.parse(atob(jwt)) : null;
			console.log("got user", appData.user);
		} catch {
			// Just delete the cookie if it has some bad data in it, and then
			// the user can log back in
			cookies.delete("jwt", { path: "/" });
		}
	},
} satisfies ServerHook;
