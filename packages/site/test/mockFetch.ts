export default function mockFetch(fetch: any, fn: Promise<Response>): void {
	// @ts-ignore
	fetch.mockResolvedValue(fn);
}
