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
	image: string | null;
	imageAltText: string | null;
	isArticle: boolean;
	linkUrl: string | null;
	linkTitle: string | null;
	linkImage: string | null;
	linkPublication: string | null;
	linkEmbedSrc: string | null;
	linkEmbedWidth: number | null;
	linkEmbedHeight: number | null;
	publishedAt: Date;
	republishedAt: Date | null;
};

export default async function feedReceived(request: Request) {
	let errorMessage: string | undefined;

	try {
		const db = database();
		return await db.transaction(async (tx) => {
			try {
				const model: FeedReceivedModel = await request.json();

				const user = await tx.query.followingTable.findFirst({
					where: eq(followingTable.shared_key, model.sharedKey),
				});
				if (!user) {
					return notFound();
				}

				// Create or update the feed record
				const feed = await tx.query.feedTable.findFirst({ where: eq(feedTable.slug, model.slug) });
				const record = {
					user_id: user.id,
					slug: model.slug,
					text: model.text,
					visibility: model.visibility,
					image: model.image,
					image_alt_text: model.imageAltText,
					is_article: model.isArticle,
					link_url: model.linkUrl,
					link_title: model.linkTitle,
					link_image: model.linkImage,
					link_publication: model.linkPublication,
					link_embed_src: model.linkEmbedSrc?.startsWith("https://") ? model.linkEmbedSrc : null,
					link_embed_width: model.linkEmbedWidth,
					link_embed_height: model.linkEmbedHeight,
					// TODO: Should receive posted_at, edited_at etc
					published_at: new Date(model.publishedAt),
					republished_at: model.republishedAt ? new Date(model.republishedAt) : undefined,
					created_at: feed?.created_at ?? new Date(),
					updated_at: new Date(),
				};
				if (feed) {
					await tx.update(feedTable).set(record).where(eq(feedTable.id, feed.id));
				} else {
					await tx.insert(feedTable).values(record);
				}

				return ok();
			} catch (error) {
				errorMessage = getErrorMessage(error).message;
				tx.rollback();
			}
		});
	} catch (error) {
		const message = errorMessage || getErrorMessage(error).message;
		return serverError(message);
	}
}
