export default interface MessageGroupModel {
	messageGroup: {
		groupSlug: string;
		userSlug: string;
		url: string;
		image: string;
		name: string;
	};
	messages: {
		id: number;
		text: string;
		read: boolean;
		sent: boolean;
		sentAt: Date;
		delivered: boolean;
	}[];
}
