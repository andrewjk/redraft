import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { usersTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import postCreateOrUpdate from "./postCreateOrUpdate";
import { PostEditModel } from "./postEdit";
import postPreview from "./postPreview";

export default async function postSave(request: Request, code: string) {
	try {
		const db = database();

		const model: PostEditModel = await request.json();

		// Get the current user
		const currentUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
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
