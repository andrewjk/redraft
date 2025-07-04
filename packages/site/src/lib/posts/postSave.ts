import { ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { activityTable, usersTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import postCreateOrUpdate from "./postCreateOrUpdate";
import { type PostEditModel } from "./postEdit";

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

		const { post } = await postCreateOrUpdate(model);

		// Create an activity record
		await db.insert(activityTable).values({
			url: `${currentUser.url}posts/${post.slug}`,
			text: `You saved a post`,
			created_at: new Date(),
			updated_at: new Date(),
		});

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
