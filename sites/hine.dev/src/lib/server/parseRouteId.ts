export function parseRouteId(path: string) {
	const regex = /\/\(collections\)\/([^/]+)\/(.+)/;
	const match = path.match(regex);

	if (!match || !match[1] || !match[2]) return null;

	return { collection: match[1], slug: match[2] };
}
