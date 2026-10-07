import { badRequest, ok, serverError, unauthorized } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import * as v from "valibot";
import database from "../../data/database";
import { usersTable } from "../../data/schema";
import { ThemeEditSchema, type ThemeEditModel } from "../../types/theme/ThemeSchema";
import getErrorMessage from "../utils/getErrorMessage";
import userIdQuery from "../utils/userIdQuery";
import { sanitizeDarkTheme, sanitizeTheme } from "./theme";

export default async function themeEdit(request: Request, code: string) {
	let errorMessage = "";

	try {
		const db = database();

		const model = (await request.json()) as ThemeEditModel;

		// Validate the model's schema (only whitelisted variables, valid values)
		const validated = v.safeParse(ThemeEditSchema, model);
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

		const light = sanitizeTheme(validated.output.light);
		const dark = sanitizeDarkTheme(validated.output.dark);
		await db
			.update(usersTable)
			.set({
				theme: light ? JSON.stringify(light) : null,
				dark_theme: dark ? JSON.stringify(dark) : null,
				updated_at: new Date(),
			})
			.where(eq(usersTable.id, user.id));

		return ok();
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
