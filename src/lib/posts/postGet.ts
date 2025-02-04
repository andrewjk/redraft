//import { notFound, ok, serverError } from "@torpor/build/response";
//import postGetPrisma from "../../db/post/postGetPrisma";
//import userGetPrisma from "../../db/user/userGetPrisma";
//import postView from "../../views/postView";
//import getErrorMessage from "../utils/getErrorMessage";
//
///**
// * Post controller that must receive a request.
// * The parameters of the request must have a slug.
// * @param req Request with a an optional jwt token verified
// * @param res Response
// * @param next NextFunction
// * @returns void
// */
//export default async function postsGet(
//	params: Record<string, string>,
//	appData: Record<string, any>,
//) {
//	const slug = params.slug;
//	const username = appData.user?.username;
//
//	try {
//		// Get the current user
//		const currentUser = await userGetPrisma(username);
//
//		// Get the post
//		const post = await postGetPrisma(slug);
//		if (!post) return notFound();
//
//		// Create the post view
//		const view = currentUser ? postView(post, currentUser) : postView(post);
//		return ok({ post: view });
//	} catch (error) {
//		const message = getErrorMessage(error).message;
//		return serverError(message);
//	}
//}
//