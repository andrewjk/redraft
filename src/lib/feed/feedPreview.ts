//import profileView from "./profileView";
import { type Feed } from "@/data/schema/feedTable";
import { FollowedBy } from "@/data/schema/followedByTable";
import { type User } from "@/data/schema/usersTable";
import { micromark } from "micromark";

type FeedAuthor = {
	name: string;
	image: string;
	url: string;
	sharedKey: string;
};

export type FeedPreview = {
	slug: string;
	text: string;
	author: FeedAuthor;
	liked: boolean;
	saved: boolean;
	emoji: string | null;
	publishedAt: Date;
	republishedAt: Date | null;
	commentCount: number;
	visibility: number;
	type: number;
	image: string | null;
	url: string | null;
	title: string | null;
	publication: string | null;
};

export default function feedPreview(
	feed: Feed & { user?: FollowedBy | null },
	currentUser: User,
): FeedPreview {
	return {
		slug: feed.slug,
		text: micromark(feed.text),
		author: feed.user
			? {
					name: feed.user.name,
					image: feed.user.image,
					url: feed.user.url,
					sharedKey: feed.user.shared_key,
				}
			: {
					name: currentUser.name,
					image: currentUser.image,
					url: currentUser.url,
					sharedKey: "",
				},
		liked: feed.liked,
		saved: feed.saved,
		emoji: feed.emoji,
		publishedAt: feed.published_at,
		republishedAt: feed.republished_at,
		commentCount: feed.comment_count,
		visibility: feed.visibility,
		type: feed.type,
		image: feed.image,
		url: feed.url,
		title: feed.title,
		publication: feed.publication,
	};
}
