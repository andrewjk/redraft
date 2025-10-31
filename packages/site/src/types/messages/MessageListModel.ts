import type MessagePreviewModel from "./MessagePreviewModel";

export default interface MessageListModel {
	messages: MessagePreviewModel[];
	messagesCount: number;
}
