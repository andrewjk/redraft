import { badRequest, ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import * as v from "valibot";
import database from "../../data/database";
import { activityTable, usersTable } from "../../data/schema";
import transaction from "../../data/transaction";
import type PostEditModel from "../../types/posts/PostEditModel";
import PostEditSchema from "../../types/posts/PostEditSchema";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import postCreateOrUpdate from "./postCreateOrUpdate";

export default async function postSave(request: Request, code: string) {
	let errorMessage = "";

	try {
		const db = database();

		let model: PostEditModel = await request.json();

		// Validate the model's schema
		let validated = v.safeParse(PostEditSchema, model);
		if (!validated.success) {
			console.log("INVALID", validated);
			return badRequest({
				message: validated.issues.map((e) => e.message).join("\n"),
				data: model,
			});
		}
		model = validated.output;

		// Get the current user
		const currentUser = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
		if (!currentUser) {
			return unauthorized();
		}

		await transaction(db, async (tx) => {
			try {
				const { post } = await postCreateOrUpdate(tx, model);

				// Create an activity record
				await tx.insert(activityTable).values({
					url: `${currentUser.url}posts/${post.slug}`,
					text: `You saved a post`,
					created_at: new Date(),
					updated_at: new Date(),
				});
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				throw error;
			}
		});

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
