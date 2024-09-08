/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
	Readable,
	Subscriber,
	Unsubscriber,
	Writable,
} from 'svelte/store';
import {} from 'svelte';
import type { ActiveType, AddTag, AnyMeltElement } from '@melt-ui/svelte';
import { createDialog } from '@melt-ui/svelte';
import { guideSearch } from '$collections/guide.search.js';
import { highlightFirst, highlightSearchResult } from '@content-thing/memdb';
import { type ComboboxFilterArg } from '$lib/combobox';
import { mdastToString } from 'content-thing';

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
	const filter = (c: ComboboxFilterArg<undefined>) => {
		const inputValue = c.elements.input?.state.value ?? '';
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
