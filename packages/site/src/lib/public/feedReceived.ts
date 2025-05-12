import { notFound, ok, serverError } from "@torpor/build/response";
import { eq } from "drizzle-orm";
import database from "../../data/database";
import { feedTable, followingTable } from "../../data/schema";
import getErrorMessage from "../utils/getErrorMessage";

export type FeedReceivedModel = {
	sharedKey: string;
	slug: string;
	text: string;
	visibility: number;
	type: number;
	image: string | null;
	url: string | null;
	title: string | null;
	publication: string | null;
	publishedAt: Date;
	republishedAt: Date | null;
};

export default async function feedReceived(request: Request) {
	try {
		const db = database();

		const model: FeedReceivedModel = await request.json();

		const user = await db.query.followingTable.findFirst({
			where: eq(followingTable.shared_key, model.sharedKey),
		});
		if (!user) {
			return notFound();
		}

		// Create or update the feed record
		const feed = await db.query.feedTable.findFirst({ where: eq(feedTable.slug, model.slug) });
		const record = {
			user_id: user.id,
			slug: model.slug,
			text: model.text,
			visibility: model.visibility,
			type: model.type,
			image: model.image,
			url: model.url,
			title: model.title,
			publication: model.publication,
			// TODO: Should receive posted_at, edited_at etc
			published_at: new Date(model.publishedAt),
			republished_at: model.republishedAt ? new Date(model.republishedAt) : undefined,
			created_at: feed?.created_at ?? new Date(),
			updated_at: new Date(),
		};
		if (feed) {
			await db.update(feedTable).set(record).where(eq(feedTable.id, feed.id));
		} else {
			await db.insert(feedTable).values(record);
		}

		return ok();
	} catch (error) {
		const message = getErrorMessage(error).message;
		return serverError(message);
	}
}
