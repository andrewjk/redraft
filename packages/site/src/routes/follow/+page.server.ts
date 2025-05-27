import { type PageServerEndPoint } from "@torpor/build";
import { ok } from "@torpor/build/response";
import env from "../../lib/env";

export default {
	load: async () => {
		return ok({ url: env().SITE_LOCATION });
	},
} satisfies PageServerEndPoint;
