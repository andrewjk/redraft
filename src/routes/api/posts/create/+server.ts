import postCreate from "@/lib/posts/postCreate";
import type { ServerEndPoint } from "@torpor/build";

export default {
	post: ({ appData, request }) => {
		console.log("GOT THIS", appData);
		return postCreate(request, appData.user.username);
	},
} satisfies ServerEndPoint;
