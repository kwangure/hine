<script lang="ts">
	import '@svelte-thing/components/css/breakpoint';
	import '@svelte-thing/components/css/size';
	import type { GuideSearchResult, MeltDialog } from './search.svelte';
	import {
		createListboxItem,
		getComboboxContext,
	} from '@svelte-thing/builders';
	import Tokens from './tokens.svelte';

	const {
		close,
		result,
	}: { close: MeltDialog['elements']['close']; result: GuideSearchResult } =
		$props();
	const combobox = getComboboxContext<GuideSearchResult>();
	const { properties } = createListboxItem({
		combobox,
		get value() {
			return result;
		},
	});
</script>

<a href="/guide/{result._id}" {...properties} use:close>
	<div class="title">
		<Tokens tokens={result.title} />
	</div>
	<div class="content">
		{#each result._content as sentence}
			<Tokens tokens={sentence.words} />
		{/each}
	</div>
</a>
