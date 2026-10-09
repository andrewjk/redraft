import { extended, htmlRenderers, sanitize, transform } from "allmark";

// Markdown may come from untrusted sources (e.g. followers on remote
// sites), so any raw HTML in it is rendered and then sanitized (allmark's
// GitHub-style sanitizer, which strips event handlers and unsafe URLs)
// before it is sent to any client
export default function renderMarkdown(text: string): string {
	return sanitize(transform(text, extended, htmlRenderers));
}
