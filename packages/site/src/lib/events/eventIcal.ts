import type { Event } from "../../data/schema/eventsTable";

/**
 * Formats a date as an iCalendar UTC timestamp, e.g. 20260101T120000Z
 */
function formatIcalDate(date: Date): string {
	return date
		.toISOString()
		.replace(/[-:]/g, "")
		.replace(/\.\d{3}/, "");
}

/**
 * Escapes text for use in an iCalendar property value.
 */
function escapeIcalText(text: string): string {
	return text
		.replace(/\\/g, "\\\\")
		.replace(/;/g, "\\;")
		.replace(/,/g, "\\,")
		.replace(/\r?\n/g, "\\n");
}

/**
 * Builds an iCalendar (.ics) document for an event. The event's duration is
 * stored in minutes.
 */
export default function eventIcal(event: Event, slug: string, title: string, url: string): string {
	const now = formatIcalDate(new Date());
	const start = event.starts_at;
	const end = event.duration
		? new Date(start.getTime() + event.duration * 60 * 1000)
		: new Date(start.getTime() + 60 * 60 * 1000);

	const lines = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//Redraft//Events//EN",
		"CALSCALE:GREGORIAN",
		"METHOD:PUBLISH",
		"BEGIN:VEVENT",
		`UID:${slug}@redraft`,
		`DTSTAMP:${now}`,
		`DTSTART:${formatIcalDate(start)}`,
		`DTEND:${formatIcalDate(end)}`,
		`SUMMARY:${escapeIcalText(title)}`,
	];

	if (event.location) {
		lines.push(`LOCATION:${escapeIcalText(event.location)}`);
	}
	if (event.text) {
		lines.push(`DESCRIPTION:${escapeIcalText(event.text)}`);
	}
	lines.push(`URL:${url}`, "END:VEVENT", "END:VCALENDAR");

	return lines.join("\r\n") + "\r\n";
}
