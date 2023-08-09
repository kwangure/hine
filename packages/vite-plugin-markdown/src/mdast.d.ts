import type { TocEntry } from './types';

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
		content: string;
		slug: string;
	}
	interface RootData {
		tableOfContents?: TocEntry[];
		frontmatter?: any;
	}
}
