import type { HeadingData } from 'mdast';

declare module 'mdast' {
	interface HeadingData {
		value: string;
		id: string;
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
