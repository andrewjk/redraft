import type MessageGroupMessageModel from "./MessageGroupMessageModel";
import type MessageGroupModel from "./MessageGroupModel";

export default interface MessageGroupListModel {
	messageGroup: MessageGroupModel;
	messages: MessageGroupMessageModel[];
}
