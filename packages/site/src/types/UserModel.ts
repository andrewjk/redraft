export default interface UserModel {
	url: string;
	username: string;
	name: string;
	image: string;
	notificationCount?: number;
	messageCount?: number;
}
