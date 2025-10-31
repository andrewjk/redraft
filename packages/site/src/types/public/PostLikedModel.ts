// IMPORTANT! Update this when the model changes
export const POST_LIKED_VERSION = 1;

export default interface PostLikedModel {
	slug: string;
	sharedKey: string;
	liked: boolean;
	version: number;
}
