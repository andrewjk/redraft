import type FollowingModel from "./FollowingModel";
import type ProfileModel from "./ProfileModel";

export default interface ExtensionLoadModel {
	profile: ProfileModel;
	following: FollowingModel[];
	notificationCount: number;
	messageCount: number;
}
