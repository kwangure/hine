<script lang="ts" generics="T">
	import '@svelte-thing/components/css/breakpoint';
	import '@svelte-thing/components/css/size';
	/* eslint-disable no-undef */
	import { type Snippet } from 'svelte';
	import { createListboxItem } from './create';
	import { getComboboxContext } from './context';

	const { children, value }: { children?: Snippet; value: T } = $props();
	const combobox = getComboboxContext<Iterable<T>, unknown>();
	const { properties } = createListboxItem({
		combobox,
		get value() {
			return value;
		},
	});
</script>

<li {...properties}>
	{#if children}
		{@render children()}
	{/if}
</li>

<style>
	li {
		align-items: center;
		border-radius: var(--st-size-1);
		display: flex;
		gap: var(--st-size-3);
		padding-block: var(--st-size-1);
		padding-inline: var(--st-size-2);
	}
	li:hover {
		--_background-color-dark: var(--st-color-preference-dark)
			var(--st-color-neutral-700);
		background-color: var(
			--_background-color-dark,
			var(--st-color-neutral-200)
		);
	}
	li[data-active-item='true'] {
		--_background-color-dark: var(--st-color-preference-dark)
			var(--st-color-blue-200);
		background-color: var(
			--_background-color-dark,
			var(--st-color-blue-100)
		);
		--_color-dark: var(--st-color-preference-dark) var(--st-color-blue-700);
		color: var(--_color-dark, var(--st-color-blue-600));
	}
	li[data-active-item='true']:hover {
		--_background-color-dark: var(--st-color-preference-dark)
			var(--st-color-blue-100);
		background-color: var(
			--_background-color-dark,
			var(--st-color-blue-200)
		);
	}
</style>
