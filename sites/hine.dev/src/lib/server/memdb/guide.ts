import type { Frontmatter } from '$collections/guide/index.js';
import { createSearchIndex, createTable, search } from '@content-thing/memdb';
import { mdastToString } from 'content-thing';

const modules = import.meta.glob<Frontmatter>('$routes/**/guide/**/data.js', {
	import: 'data',
	eager: true,
});
const data = Object.values(modules);
export const guideTable = createTable<Frontmatter>(data);
const { averageDocumentLength, documentLengths, invertedIndex } =
	createSearchIndex(guideTable, {
		title: (x) => x,
		_content: mdastToString,
	});
export const guideSearch = (query: string) =>
	search(
		guideTable,
		invertedIndex,
		documentLengths,
		averageDocumentLength,
		query,
	);
