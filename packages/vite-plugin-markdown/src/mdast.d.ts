import 'mdast';

declare module 'mdast' {
	interface CodeData {
		file?: string;
		lang?: string;
	}
	interface InlineCodeData {
		lang?: string;
	}
	interface HeadingData {
		slug: string;
	}
}
