import type FollowingModel from "./FollowingModel";
import type ProfileModel from "./ProfileModel";

export default interface ExtensionRefreshModel {
	profile?: ProfileModel;
	following?: FollowingModel[];
	notificationCount: number;
	messageCount: number;
}
