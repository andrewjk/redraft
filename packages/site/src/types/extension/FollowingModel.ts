export default interface FollowingModel {
	approved: boolean;
	url: string;
	name: string;
	image: string;
	token: string;
	deleted?: boolean;
}
