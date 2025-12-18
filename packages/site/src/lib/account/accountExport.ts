import { badRequest, forbidden, serverError, unauthorized } from "@torpor/build/response";
import { BlobWriter, TextReader, ZipWriter } from "@zip.js/zip.js";
import { eq } from "drizzle-orm";
import * as v from "valibot";
import database from "../../data/database";
import { activityTable, usersTable } from "../../data/schema";
import type ExportModel from "../../types/account/ExportModel";
import ExportSchema from "../../types/account/ExportSchema";
import getErrorMessage from "../utils/getErrorMessage";
import { compareWithHash } from "../utils/hashPasswords";
import userIdQuery from "../utils/userIdQuery";

export default async function accountExport(request: Request, code: string) {
	let errorMessage = "";

	try {
		const db = database();

		let model: ExportModel = await request.json();

		// Validate the model's schema
		let validated = v.safeParse(ExportSchema, model);
		if (!validated.success) {
			model.password = "";
			const message = validated.issues.map((e) => e.message).join("\n");
			console.log("ERROR", message);
			return badRequest({
				message,
				data: model,
			});
		}
		model = validated.output;

		// Get the current user
		const user = await db.query.usersTable.findFirst({
			where: eq(usersTable.id, userIdQuery(code)),
		});
		if (!user) {
			return unauthorized();
		}

		// Compare the given password with the one stored
		if (!user || !compareWithHash(model.password.trim(), user.password)) {
			model.password = "";
			return forbidden({
				message: "Invalid password",
				data: model,
			});
		}

		const zipFileWriter = new BlobWriter();
		const zipWriter = new ZipWriter(zipFileWriter);

		await addSqlFile(zipWriter, "activity", await db.query.activityTable.findMany());
		await addSqlFile(zipWriter, "articles", await db.query.articlesTable.findMany());
		await addSqlFile(zipWriter, "comments", await db.query.commentsTable.findMany());
		await addSqlFile(zipWriter, "content", await db.query.contentTable.findMany());
		await addSqlFile(zipWriter, "events", await db.query.eventsTable.findMany());
		await addSqlFile(zipWriter, "feed", await db.query.feedTable.findMany());
		await addSqlFile(zipWriter, "followed_by", await db.query.followedByTable.findMany());
		await addSqlFile(zipWriter, "following", await db.query.followingTable.findMany());
		await addSqlFile(zipWriter, "lists", await db.query.listsTable.findMany());
		await addSqlFile(zipWriter, "list_users", await db.query.listUsersTable.findMany());
		await addSqlFile(zipWriter, "message_groups", await db.query.messageGroupsTable.findMany());
		await addSqlFile(zipWriter, "messages", await db.query.messagesTable.findMany());
		await addSqlFile(zipWriter, "notifications", await db.query.notificationsTable.findMany());
		await addSqlFile(zipWriter, "post_reactions", await db.query.postReactionsTable.findMany());
		await addSqlFile(zipWriter, "posts_queue", await db.query.postsQueueTable.findMany());
		await addSqlFile(zipWriter, "posts", await db.query.postsTable.findMany());
		await addSqlFile(zipWriter, "tags", await db.query.tagsTable.findMany());

		const zipBlob = await zipWriter.close();

		// Create an activity record
		await db.insert(activityTable).values({
			url: user.url,
			text: "You exported your data",
			created_at: new Date(),
			updated_at: new Date(),
		});

		return new Response(zipBlob, {
			status: 200,
			headers: {
				"Content-Disposition": 'attachment; filename="redraft.zip"',
				"Content-Type": "application/zip",
				"Content-Length": zipBlob.size.toString(),
			},
		});
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}

async function addSqlFile(zipWriter: ZipWriter<Blob>, name: string, items: any) {
	let sql = "";
	if (items.length > 0) {
		let columns = Object.keys(items[0])
			.map((c) => `\`${c}\``)
			.join(", ");
		for (let post of items) {
			sql += `INSERT INTO \`${name}\` (${columns}) VALUES (${Object.values(post)
				.map((v) => {
					if (v === undefined || v === null) {
						return "NULL";
					} else if (typeof v === "string") {
						return `"${v.replaceAll('"', '\\"')}"`;
					} else if (v instanceof Date) {
						return v.getTime();
					} else {
						return Number(v);
					}
				})
				.join(", ")});\n`;
		}
	}
	const postsReader = new TextReader(sql);
	await zipWriter.add(`redraft/db/${name}.sql`, postsReader);
}
