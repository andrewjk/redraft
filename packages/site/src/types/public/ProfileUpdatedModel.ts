// IMPORTANT! Update this when the model changes
export const PROFILE_UPDATED_VERSION = 1;

export default interface ProfileUpdatedModel {
	sharedKey: string;
	name: string;
	image: string;
	bio: string;
	version: number;
}
