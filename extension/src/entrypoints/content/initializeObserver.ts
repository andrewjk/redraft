import { formatContent } from "./formatContent";

export function initializeObserver(): void {
	// HACK: We don't currently send @head elements with SSR, so we need to
	// listen for changes from when the page is hydrated. This may change...
	const targetNode = document.head;
	const config = { childList: true };
	const observer = new MutationObserver(() => {
		formatContent();
	});
	observer.observe(targetNode, config);
}
