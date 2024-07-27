import { createDialog } from '@melt-ui/svelte';
import { derived, writable } from 'svelte/store';
import { guideSearch } from '$collections/guide.search.js';
import { highlightFirst, highlightSearchResult } from '@content-thing/memdb';
import { mdastToString } from 'content-thing';

export function createSearch() {
	const dialog = createDialog();
	const query = writable('');
	const searchResults = derived(query, ($query) => {
		const results = guideSearch($query);
		const highlightedResults = [];
		for (const result of results) {
			const { title } = highlightSearchResult(result, {
				title: (s) => s,
			});
			highlightedResults.push({
				title,
				_id: result.document._id,
				_content: highlightFirst(
					result,
					{ _content: (s) => mdastToString(s) },
					{ matchLength: 20 },
				),
			});
		}
		return highlightedResults;
	});

	return {
		inputs: { query },
		outputs: { dialog, searchResults },
	};
}
