import database from "@/data/database";
import { ok, serverError, unauthorized } from "@torpor/build/response";
import getErrorMessage from "../utils/getErrorMessage";
import postCreateOrUpdate from "./postCreateOrUpdate";
import { PostEditModel } from "./postEdit";
import postPreview from "./postPreview";

export default async function postSave(request: Request) {
	const db = database();

	try {
		const model: PostEditModel = await request.json();

		// Get the current (only) user
		const currentUser = await db.query.usersTable.findFirst();
		if (!currentUser) {
			return unauthorized();
		}

		const result = await postCreateOrUpdate(model);
		const view = postPreview(result.post, currentUser);
		if (result.op === "create") {
			return ok(view);
		} else if (result.op === "update") {
			return ok(view);
		}
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
