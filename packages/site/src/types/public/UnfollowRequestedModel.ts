// IMPORTANT! Update this when the model changes
export const UNFOLLOW_REQUESTED_VERSION = 1;

export default interface UnfollowRequestedModel {
	url: string;
	sharedKey: string;
	version: number;
}
