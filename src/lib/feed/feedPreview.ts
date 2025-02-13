//import profileView from "./profileView";
import { type Feed } from "@/data/schema/feedTable";
import { FollowedBy } from "@/data/schema/followedByTable";
import { type User } from "@/data/schema/usersTable";

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
	createdAt: Date;
	updatedAt: Date;
	commentCount: number;
};

export default function feedPreview(
	feed: Feed & { user?: FollowedBy | null },
	currentUser: User,
): FeedPreview {
	return {
		slug: feed.slug,
		text: feed.text,
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
		createdAt: feed.created_at,
		updatedAt: feed.updated_at,
		commentCount: feed.comment_count,
	};
}
