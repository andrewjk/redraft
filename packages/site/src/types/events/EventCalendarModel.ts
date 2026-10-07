export interface EventCalendarItem {
	slug: string;
	title: string;
	startsAt: Date;
	location: string | null | undefined;
	url: string;
}

export interface EventCalendarDay {
	/** The day number, e.g. 1-31 */
	day: number;
	/** Whether this day falls within the displayed month */
	inMonth: boolean;
	isToday: boolean;
	events: EventCalendarItem[];
}

export default interface EventCalendarModel {
	year: number;
	/** The month, 1-12 */
	month: number;
	label: string;
	/** The previous/next months as `YYYY-MM` */
	prev: string;
	next: string;
	weeks: EventCalendarDay[][];
}
