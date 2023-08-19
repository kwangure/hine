export interface TocEntry {
	content: string;
	slug: string;
	depth: 2 | 3;
	children: TocEntry[];
}
