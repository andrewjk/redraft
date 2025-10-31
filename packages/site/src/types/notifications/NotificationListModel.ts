import type NotificationPreviewModel from "./NotificationPreviewModel";

export default interface NotificationListModel {
	notifications: NotificationPreviewModel[];
	notificationsCount: number;
}
