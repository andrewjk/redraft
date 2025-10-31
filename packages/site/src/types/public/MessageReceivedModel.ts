// IMPORTANT! Update this when the model changes
export const MESSAGE_RECEIVED_VERSION = 1;

export default interface MessageReceivedModel {
	sharedKey: string;
	slug: string;
	text: string;
	version: number;
}
