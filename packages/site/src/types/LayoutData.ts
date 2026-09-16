import type AppData from "./AppData";
import type FollowerModel from "./FollowerModel";
import type ViewingModel from "./ViewingModel";

export default interface LayoutData extends AppData {
	/**
	 * The user that is currently being viewed e.g. if we on the page at
	 * `https://redraft.social/abc` this would be the user with the username
	 * `abc`. This will affect what is shown in the title etc
	 */
	viewing?: ViewingModel;
	/**
	 * The user who is following the user being viewed, using the web extension.
	 * If this is set, the `unfollow` link will be set rather than the `follow`
	 * link.
	 */
	follower?: FollowerModel;
}
