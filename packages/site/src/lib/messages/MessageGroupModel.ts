export type MessageGroupModel = {
	messageGroup: {
		slug: string;
		url: string;
		image: string;
		name: string;
	};
	messages: {
		id: number;
		text: string;
		sent: boolean;
		sentAt: Date;
		delivered: boolean;
	}[];
};
