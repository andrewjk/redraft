import pluralize from "./pluralize";

let fmt = new Intl.DateTimeFormat(undefined, {
	day: "numeric",
	month: "short",
	year: "numeric",
});

const ONE_MINUTE = 60;
const ONE_HOUR = 60 * 60;
const ONE_DAY = 60 * 60 * 24;
const ONE_WEEK = 60 * 60 * 24 * 7;

// Adapted from https://stackoverflow.com/a/23352499

/**
 * Gets an English language description of a date relative to the current time
 * e.g. "5 minutes ago".
 *
 * @param date The date.
 * @param sentenced Whether the date is in a sentence (and shouldn't be
 * capitalized).
 * @returns The relative date description.
 */
export default function relativeTimeSince(date: Date, sentenced = false) {
	let now = new Date();
	let secondsPast = (now.getTime() - date.getTime()) / 1000;
	if (secondsPast < ONE_MINUTE) {
		return `${sentenced ? "j" : "J"}ust now`;
	}
	if (secondsPast < ONE_HOUR) {
		let minutes = Math.floor(secondsPast / ONE_MINUTE);
		return `${pluralize(minutes, "minute")} ago`;
	}
	if (secondsPast <= ONE_DAY) {
		let hours = Math.floor(secondsPast / ONE_HOUR);
		return `${pluralize(hours, "hour")} ago`;
	}
	if (secondsPast <= ONE_WEEK) {
		let days = Math.floor(secondsPast / ONE_DAY);
		return `${pluralize(days, "day")} ago`;
	}
	if (secondsPast > ONE_WEEK) {
		// Just return the date in `d MMM yyyy` format, because e.g. "5 weeks
		// ago" isn't that useful
		return fmt.format(date);
	}
}
