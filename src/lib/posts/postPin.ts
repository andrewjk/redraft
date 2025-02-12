import db from "@/data/db";
import { postsTable } from "@/data/schema";
import { ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import getErrorMessage from "../utils/getErrorMessage";

export type PostPinModel = {
	slug: string;
	pinned: boolean;
};

export default async function postPin(request: Request) {
	try {
		const model: PostPinModel = await request.json();

		// Update the post
		await db
			.update(postsTable)
			.set({
				pinned: model.pinned,
			})
			.where(eq(postsTable.slug, model.slug));

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
