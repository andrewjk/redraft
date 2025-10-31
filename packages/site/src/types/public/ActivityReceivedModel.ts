// IMPORTANT! Update this when the model changes
export const ACTIVITY_RECEIVED_VERSION = 1;

export default interface ActivityReceivedModel {
	sharedKey: string;
	url: string;
	type: "commented" | "liked" | "unliked" | "reacted";
	version: number;
}
