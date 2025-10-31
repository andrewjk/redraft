// IMPORTANT! Update this when the model changes
export const POST_REACTION_VERSION = 1;

export default interface PostReactionModel {
	slug: string;
	sharedKey: string;
	emoji: string;
	version: number;
}
