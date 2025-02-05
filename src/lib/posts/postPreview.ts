//import profileView from "./profileView";
import { type Post, type User } from "@/data/schema";

export type PostPreview = {
	text: string;
	author: {
		image: string;
		username: string;
	};
	createdAt: Date;
	updatedAt: Date;
};

export default function postPreview(post: Post, currentUser?: User): PostPreview {
	// TODO:
	//const authorView = profileView(post.author, currentUser);

	const postView = {
		text: post.text,
		author: {
			image: currentUser?.image ?? "",
			username: currentUser?.username ?? "",
		},
		createdAt: post.created_at,
		updatedAt: post.updated_at,
	};

	return postView;
}
