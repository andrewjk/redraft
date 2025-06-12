/**
 * Converts an input text to an uri safe string.
 * @param text text to convert to a slug
 * @returns the slug string
 */
export default function sluggify(text: string, withDate = false) {
	return (
		(withDate ? sluggifiedDate() : "") +
		text
			.normalize("NFD")
			.replace(/[\u0300-\u036f]/g, "")
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, "")
			.replace(/[\s_-]+/g, "-")
			.replace(/^-+|-+$/g, "")
	);
}

function sluggifiedDate() {
	const now = new Date();
	return `${now.getFullYear()}-${now.getMonth().toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")}-`;
}
