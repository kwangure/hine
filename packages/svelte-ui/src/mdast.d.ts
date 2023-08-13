import type { HeadingData } from 'mdast';

declare module 'mdast' {
	interface HeadingData {
		content: string;
		slug: string;
	}
	interface InlineCodeData {
		attributes: {
			lang?: string;
		};
	}
	interface CodeData {
		attributes: {
			copy?: string;
		};
	}
}
