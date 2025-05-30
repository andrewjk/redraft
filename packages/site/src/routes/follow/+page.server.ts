import { type PageServerEndPoint } from "@torpor/build";
import { ok } from "@torpor/build/response";
import env from "../../lib/env";
import ensureSlash from "../../lib/utils/ensureSlash";

export default {
	load: async () => {
		return ok({ url: ensureSlash(env().SITE_LOCATION) });
	},
} satisfies PageServerEndPoint;
