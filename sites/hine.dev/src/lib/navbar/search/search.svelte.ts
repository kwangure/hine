import { createDialog } from '@melt-ui/svelte';
import { guideSearch } from '$collections/guide.search.js';
import { highlightFirst, highlightSearchResult } from '@content-thing/memdb';
import { mdastToString } from 'content-thing';
import type { ComboboxFilterArg } from '@svelte-thing/builders';

/* eslint-disable @typescript-eslint/no-unused-vars */
import * as Store from 'svelte/store';
export * from '@melt-ui/svelte/internal/actions';
export * from '@melt-ui/svelte/internal/helpers';
export * from '@melt-ui/svelte/internal/types';

export interface GuideSearchResult {
	title: [string, boolean][];
	_id: string;
	_content: {
		words: [string, boolean][];
	}[];
}

export type MeltDialog = ReturnType<typeof createDialog>;

export function createSearch() {
	const dialog: MeltDialog = createDialog();
	const filter = (c: ComboboxFilterArg<GuideSearchResult>) => {
		const inputValue = c.inputValue;
		const results = guideSearch(inputValue);
		const highlightedResults: GuideSearchResult[] = [];
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
	};

	return { filter, dialog };
}
