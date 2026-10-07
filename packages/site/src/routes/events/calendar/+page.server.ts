import { type PageServerEndPoint } from "@torpor/build";
import { ok } from "@torpor/build/response";
import eventCalendar from "../../../lib/events/eventCalendar";

/**
 * Parses a `YYYY-MM` month, defaulting to the current month.
 */
function parseMonth(value: string | null): { year: number; month: number } {
	const now = new Date();
	if (value) {
		const match = /^(\d{4})-(\d{1,2})$/.exec(value);
		if (match) {
			const year = +match[1];
			const month = +match[2];
			if (month >= 1 && month <= 12) {
				return { year, month };
			}
		}
	}
	return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export default {
	load: async ({ appData, url }) => {
		const { year, month } = parseMonth(url.searchParams.get("month"));
		const calendar = await eventCalendar(appData.user, appData.follower, year, month);
		return ok({ calendar });
	},
} satisfies PageServerEndPoint;
