let fmt = new Intl.DateTimeFormat(undefined, {
	day: "numeric",
	month: "short",
	year: "numeric",
});

// From https://stackoverflow.com/a/23352499
export default function relativeTimeSince(datetime: Date) {
	let now = new Date();
	let secondsPast = (now.getTime() - datetime.getTime()) / 1000;
	if (secondsPast < 60) {
		let seconds = Math.floor(secondsPast);
		return `${seconds} seconds ago`;
	}
	if (secondsPast < 3600) {
		let minutes = Math.floor(secondsPast / 60);
		return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
	}
	if (secondsPast <= 86400) {
		let hours = Math.floor(secondsPast / 3600);
		return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
	}
	if (secondsPast > 86400) {
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
