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
export default function relativeTimeSince(datetime: Date) {
	let now = new Date();
	let secondsPast = (now.getTime() - datetime.getTime()) / 1000;
	if (secondsPast < ONE_MINUTE) {
		let seconds = Math.floor(secondsPast);
		return `${pluralize(seconds, "second")} ago`;
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
		//let day = datetime.getDate();
		//let month = datetime
		//	.toDateString()
		//	.match(/ [a-zA-Z]*/)![0]
		//	.replace(" ", "");
		//let year = datetime.getFullYear() == now.getFullYear() ? "" : " " + datetime.getFullYear();
		//return day + " " + month + year;
		return fmt.format(datetime);
	}
}
