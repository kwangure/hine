import type { TocEntry } from './types';

import 'mdast';

declare module 'mdast' {
	interface HeadingData {
		content: string;
		slug: string;
	}
	interface RootData {
		tableOfContents?: TocEntry[];
		frontmatter?: any;
	}
}
