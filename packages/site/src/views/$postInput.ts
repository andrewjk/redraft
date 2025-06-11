import { $watch } from "@torpor/view";

/**
 * The shared data for a post that is being written, so that we can keep it across pages
 */
const $postInput = $watch({
	id: -1,
	type: 0,
	visibility: 0,
	children: [],
});

export default $postInput;
