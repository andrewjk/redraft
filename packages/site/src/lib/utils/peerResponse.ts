/**
 * Creates a local response with the status and body of a peer site's
 * response.
 *
 * Peer responses come from `fetch`, whose Response objects have immutable
 * headers -- returning one from an endpoint means the framework can't append
 * its own headers (e.g. set-cookie), so the status and body are copied into
 * a fresh Response instead.
 */
export default async function peerResponse(response: Response): Promise<Response> {
	const text = await response.text();
	return new Response(text, {
		status: response.status,
		statusText: response.statusText,
		headers: { "content-type": response.headers.get("content-type") ?? "text/plain" },
	});
}
