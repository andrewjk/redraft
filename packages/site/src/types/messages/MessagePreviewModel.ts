export default interface MessagePreviewModel {
	slug: string;
	url: string;
	image: string;
	name: string;
	newestAt: Date;
	text: string;
	sent: boolean;
	unreadCount: number;
}
