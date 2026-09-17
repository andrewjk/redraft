import { micromark, type Options } from "micromark";
import sanitizeHtml from "sanitize-html";

// Markdown may come from untrusted sources (e.g. followers on remote
// sites), so any raw HTML in it is converted and then sanitized before it
// is sent to any client
export default function renderMarkdown(text: string, options?: Options): string {
	return sanitizeHtml(micromark(text, { ...options, allowDangerousHtml: true }), {
		allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
		allowedAttributes: {
			...sanitizeHtml.defaults.allowedAttributes,
			img: ["src", "srcset", "alt", "title", "width", "height", "loading"],
		},
	});
}
