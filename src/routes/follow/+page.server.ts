import * as api from "@/lib/api";
import formDataToObject from "@/lib/utils/formDataToObject";
import { type PageServerEndPoint } from "@torpor/build";
import { ok, unprocessable } from "@torpor/build/response";

export default {
	actions: {
		default: async ({ request, params }) => {
			const data = await request.formData();
			const model = formDataToObject(data);

			const result = await api.post("follow", params, model);
			if (result.errors) {
				return unprocessable(result);
			}

			return ok("Message sent");
		},
	},
} satisfies PageServerEndPoint;
