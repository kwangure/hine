import type { Heading, HeadingData } from 'mdast';

export interface HeadingWithData extends Heading {
	data: HeadingData & {
		children: HeadingWithData[];
		content: string;
		slug: string;
	};
}
