//import profileView from "./profileView";
import { type Post, type User } from "@/data/schema";

export default function postView(post: Post, currentUser?: User) {
	// TODO:
	//const authorView = profileView(post.author, currentUser);

	const postView = {
		text: post.text,
		createdAt: post.created_at,
		updatedAt: post.updated_at,
	};
	return postView;
}
