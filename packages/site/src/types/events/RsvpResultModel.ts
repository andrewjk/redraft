export default interface RsvpResultModel {
	goingCount: number;
	maybeCount: number;
	declinedCount: number;
	/** The viewer's status after the RSVP, or null if they have not RSVP'd */
	viewerStatus: number | null;
}
