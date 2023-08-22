import type { TocEntry } from './types';

import 'mdast';

declare module 'mdast' {
	interface CodeData {
		attributes: {
			copy?: string;
			file?: string;
		};
	}
	interface InlineCodeData {
		attributes: {
			lang?: string;
		};
	}
	interface HeadingData {
		value: string;
		id: string;
	}
	interface RootData {
		tableOfContents?: TocEntry[];
		frontmatter?: any;
	}
}
