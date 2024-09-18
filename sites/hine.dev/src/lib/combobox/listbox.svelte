<script lang="ts" generics="TOption">
	/* eslint-disable no-undef */
	import type { Snippet } from 'svelte';
	import {
		createComboboxListbox,
		getComboboxContext,
	} from '@svelte-thing/builders';

	const { children }: { children: Snippet<[typeof combobox]> } = $props();
	const combobox = getComboboxContext<TOption>();
	const { properties } = createComboboxListbox({ combobox });
</script>

<ul {...properties}>
	{@render children(combobox)}
</ul>

<style>
	ul {
		--_background-color-dark: var(--st-color-preference-dark)
			var(--st-color-neutral-800);
		background-color: var(--_background-color-dark, var(--st-color-white));
		--_border-color-dark: var(--st-color-preference-dark)
			var(--st-color-neutral-600);
		border-color: var(--_border-color-dark, var(--st-color-neutral-300));
		border-radius: var(--st-size-1);
		border-width: 1px;
		--_box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1),
			0 4px 6px -4px rgb(0 0 0 / 0.1);
		--_box-shadow-dark: var(--st-color-preference-dark) 0 10px 15px -3px rgb(0
						0 0 / 0.25),
			0 4px 6px -4px rgb(0 0 0 / 0.1);
		box-shadow: var(--_box-shadow-dark, var(--_box-shadow));
		display: flex;
		flex-direction: column;
		min-width: var(--st-size-40);
		padding: var(--st-size-2);
	}
</style>
