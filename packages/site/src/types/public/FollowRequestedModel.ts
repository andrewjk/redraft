// IMPORTANT! Update this when the model changes
export const FOLLOW_REQUESTED_VERSION = 1;

export default interface FollowRequestedModel {
	url: string;
	sharedKey: string;
	version: number;
}
