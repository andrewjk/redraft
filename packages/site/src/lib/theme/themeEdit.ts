import { badRequest, ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import * as v from "valibot";
import database from "../../data/database";
import { usersTable } from "../../data/schema";
import type { ThemeModel } from "../../types/theme/ThemeModel";
import ThemeSchema from "../../types/theme/ThemeSchema";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import { sanitizeTheme } from "./theme";

export default async function themeEdit(request: Request, code: string) {
	let errorMessage = "";

	try {
		const db = database();

		const model = (await request.json()) as ThemeModel;

		// Validate the model's schema (only whitelisted variables, valid values)
		const validated = v.safeParse(ThemeSchema, model);
		if (!validated.success) {
			const message = validated.issues.map((e) => e.message).join("\n");
			return badRequest({ message, data: model });
		}

		// Get the current user
		const user = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
		if (!user) {
			return unauthorized();
		}

		const theme = sanitizeTheme(validated.output);
		await db
			.update(usersTable)
			.set({ theme: theme ? JSON.stringify(theme) : null, updated_at: new Date() })
			.where(eq(usersTable.id, user.id));

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
