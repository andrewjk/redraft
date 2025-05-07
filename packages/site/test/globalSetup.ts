import { LibSQLDatabase, drizzle } from "drizzle-orm/libsql";
import fs from "node:fs";
import * as schema from "../src/data/schema/index";
import type { User } from "../src/data/schema/usersTable";
import { ARTICLE_POST_TYPE, IMAGE_POST_TYPE, TEXT_POST_TYPE } from "../src/lib/constants";
import { hashPassword } from "../src/lib/utils/hashPasswords";

export async function setup(): Promise<void> {
	// Copy empty.db to filled.db
	fs.copyFileSync("./test/data/empty.db", "./test/data/filled.db");

	// Fill filled.db with some test data
	const db = drizzle("file:./test/data/filled.db", { schema });
	await insertUsers(db);
	const users = await db.query.usersTable.findMany();
	await insertUserTokens(db, users);
	await insertPosts(db);
	await insertMedia(db);
	await insertArticles(db);
}

async function insertUsers(db: LibSQLDatabase<typeof schema>) {
	await db.insert(schema.usersTable).values([
		{
			email: "alice@localhost",
			username: "alice",
			url: "http://localhost/alice",
			password: hashPassword("alice's password"),
			name: "Alice X",
			bio: "Alice's bio...",
			image: "alice.png",
			location: "Alice's location...",
			created_at: new Date(),
			updated_at: new Date(),
		},
		//{
		//	email: "bob@localhost",
		//	username: "bob",
		//	url: "http://localhost/bob",
		//	password: hashPassword("bob's password"),
		//	name: "Bob Y",
		//	bio: "Bob's bio...",
		//	image: "bob.png",
		//	location: "Bob's location...",
		//	created_at: new Date(),
		//	updated_at: new Date(),
		//},
	]);
}

async function insertUserTokens(db: LibSQLDatabase<typeof schema>, users: User[]) {
	users.forEach(async (u) => {
		await db
			.insert(schema.userTokensTable)
			.values([{ user_id: u.id, code: `xxx-${u.username}`, expires_at: new Date() }]);
	});
}

async function insertPosts(db: LibSQLDatabase<typeof schema>) {
	await db.insert(schema.postsTable).values([
		{
			slug: "post-1",
			text: "Here is a post",
			visibility: 0,
			type: TEXT_POST_TYPE,
			image: "",
			url: "post-1",
			title: "Post 1",
			published_at: new Date(),
			created_at: new Date(),
			updated_at: new Date(),
		},
		{
			slug: "post-2",
			text: "Here is a draft post",
			visibility: 0,
			type: TEXT_POST_TYPE,
			image: "",
			url: "post-2",
			title: "Post 2",
			//published_at: new Date(),
			created_at: new Date(),
			updated_at: new Date(),
		},
	]);
}

async function insertMedia(db: LibSQLDatabase<typeof schema>) {
	await db.insert(schema.postsTable).values([
		{
			slug: "image-1",
			text: "Here is a picture",
			visibility: 0,
			type: IMAGE_POST_TYPE,
			image: "image1.png",
			url: "image-1",
			title: "Image 1",
			published_at: new Date(),
			created_at: new Date(),
			updated_at: new Date(),
		},
		{
			slug: "image-2",
			text: "Here is a draft picture",
			visibility: 0,
			type: IMAGE_POST_TYPE,
			image: "image2.png",
			url: "image-2",
			title: "Image 2",
			//published_at: new Date(),
			created_at: new Date(),
			updated_at: new Date(),
		},
	]);
}

async function insertArticles(db: LibSQLDatabase<typeof schema>) {
	const article = (
		await db
			.insert(schema.articlesTable)
			.values({
				text: "Here is the text of an article",
				created_at: new Date(),
				updated_at: new Date(),
			})
			.returning()
	)[0];

	await db.insert(schema.postsTable).values([
		{
			slug: "article-1",
			text: "Here is an article",
			visibility: 0,
			type: ARTICLE_POST_TYPE,
			image: "",
			article_id: article.id,
			url: "article-1",
			title: "Article 1",
			published_at: new Date(),
			created_at: new Date(),
			updated_at: new Date(),
		},
	]);

	const draft = (
		await db
			.insert(schema.articlesTable)
			.values({
				text: "Here is the text of a draft article",
				created_at: new Date(),
				updated_at: new Date(),
			})
			.returning()
	)[0];

	await db.insert(schema.postsTable).values([
		{
			slug: "article-2",
			text: "Here is a draft article",
			visibility: 0,
			type: ARTICLE_POST_TYPE,
			image: "",
			article_id: draft.id,
			url: "article-2",
			title: "Article 2",
			//published_at: new Date(),
			created_at: new Date(),
			updated_at: new Date(),
		},
	]);
}

export async function teardown(): Promise<void> {
	fs.rmSync("./test/data/filled.db");
}
