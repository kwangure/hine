import type { CodeData, InlineCodeData, HeadingData } from 'mdast';
import type { TocEntry } from '@hinejs/vite-plugin-markdown';

declare module 'mdast' {
	interface CodeData {
		attributes: {
			copy?: string;
			file?: string;
		};
	}
	interface HeadingData {
		content: string;
		slug: string;
	}
	interface RootData {
		tableOfContents: TocEntry[];
		frontmatter?: any;
	}
}
