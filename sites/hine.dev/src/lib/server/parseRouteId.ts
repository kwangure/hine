export function parseRouteId(url: URL) {
	const regex = /\/([^/]+)\/(.+)/;
	const match = url.pathname.match(regex);

	if (!match || !match[1] || !match[2]) return null;

	return { collection: match[1], slug: match[2] };
}
