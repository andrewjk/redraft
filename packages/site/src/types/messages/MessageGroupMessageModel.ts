export default interface MessageGroupMessageModel {
	id: number;
	text: string;
	read: boolean;
	sent: boolean;
	sentAt: Date;
	delivered: boolean;
}
