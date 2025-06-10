import { LibSQLDatabase, drizzle } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import fs from "node:fs";
import * as schema from "../src/data/schema/index";
import { hashPassword } from "../src/lib/utils/hashPasswords";

export async function setup(): Promise<void> {
	// Create and fill testdata.db with some test data
	const db = drizzle("file:./test/data/testdata.db", { schema });
	await migrate(db, { migrationsFolder: "./src/data/migrations" });

	await insertUser(db);
	await insertFollowedBy(db);
	await insertFollowing(db);
	await insertPosts(db);
	await insertMedia(db);
	await insertArticles(db);
	await insertFeed(db);
	await insertNotifications(db);
}

async function insertUser(db: LibSQLDatabase<typeof schema>) {
	const user = (
		await db
			.insert(schema.usersTable)
			.values({
				email: "alice@localhost",
				username: "alice",
				url: "http://localhost/alice/",
				password: hashPassword("alice's password"),
				name: "Alice X",
				bio: "Alice's bio...",
				location: "Alice's location...",
				image: "alice.png",
				created_at: new Date(),
				updated_at: new Date(),
			})
			.returning()
	)[0];

	await db.insert(schema.userTokensTable).values({
		user_id: user.id,
		code: `xxx-${user.username}`,
		expires_at: new Date(),
	});
}

async function insertFollowedBy(db: LibSQLDatabase<typeof schema>) {
	await db.insert(schema.followedByTable).values({
		approved: true,
		url: "http://localhost/bob/",
		shared_key: "yyy-bob",
		name: "Bob Y",
		bio: "Bob's bio...",
		image: "bob.png",
		created_at: new Date(),
		updated_at: new Date(),
	});
}

async function insertFollowing(db: LibSQLDatabase<typeof schema>) {
	await db.insert(schema.followingTable).values([
		{
			approved: true,
			url: "http://localhost/eli/",
			shared_key: "yyy-eli",
			name: "Eli Q",
			bio: "Eli's bio...",
			image: "eli.png",
			created_at: new Date(),
			updated_at: new Date(),
		},
		{
			// Not yet approved i.e. a request
			approved: false,
			url: "http://localhost/freya/",
			shared_key: "yyy-freya",
			name: "Freya S",
			bio: "Freya's bio...",
			image: "freya.png",
			created_at: new Date(),
			updated_at: new Date(),
		},
	]);
}

async function insertPosts(db: LibSQLDatabase<typeof schema>) {
	await db.insert(schema.postsTable).values([
		{
			slug: "post-1",
			text: "Here is a post",
			visibility: 0,
			published_at: new Date(),
			created_at: new Date(),
			updated_at: new Date(),
		},
		{
			slug: "post-2",
			text: "Here is a draft post",
			visibility: 0,
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
			image: "image1.png",
			published_at: new Date(),
			created_at: new Date(),
			updated_at: new Date(),
		},
		{
			slug: "image-2",
			text: "Here is a draft picture",
			visibility: 0,
			image: "image2.png",
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
			is_article: true,
			article_id: article.id,
			link_url: "article-1",
			link_title: "Article 1",
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
			is_article: true,
			article_id: draft.id,
			link_url: "article-2",
			link_title: "Article 2",
			//published_at: new Date(),
			created_at: new Date(),
			updated_at: new Date(),
		},
	]);
}

async function insertFeed(db: LibSQLDatabase<typeof schema>) {
	const following = await db.query.followingTable.findFirst();

	await db.insert(schema.feedTable).values([
		{
			user_id: following!.id,
			slug: "feed-1",
			text: "Here is a post by Eli",
			visibility: 0,
			published_at: new Date(),
			created_at: new Date(),
			updated_at: new Date(),
		},
	]);
}

async function insertNotifications(db: LibSQLDatabase<typeof schema>) {
	await db.insert(schema.notificationsTable).values([
		{
			url: "http://localhost/alice/post-1",
			text: "Someone commented on your post",
			created_at: new Date(),
			updated_at: new Date(),
		},
	]);
}
export async function teardown(): Promise<void> {
	fs.rmSync("./test/data/testdata.db");
}
