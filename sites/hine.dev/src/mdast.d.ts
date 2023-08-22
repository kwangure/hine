import type { CodeData, InlineCodeData, HeadingData } from 'mdast';
import type { TocEntry } from '@hinejs/content-thing';

declare module 'mdast' {
	interface CodeData {
		attributes: {
			copy?: string;
			file?: string;
		};
	}
	interface HeadingData {
		value: string;
		id: string;
	}
	interface RootData {
		tableOfContents: TocEntry[];
		frontmatter?: any;
	}
}
