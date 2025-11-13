import { $watch } from "@torpor/view";
import type PostEditModel from "../types/posts/PostEditModel";

/**
 * The shared data for a post that is being written, so that we can keep it across pages
 */
const $postInput = $watch({
	id: -1,
	text: "",
} satisfies PostEditModel);

export default $postInput;
