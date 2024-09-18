<script lang="ts">
	import type { Snippet } from 'svelte';
	import {
		createComboboxLabel,
		getComboboxContext,
	} from '@svelte-thing/builders';

	const { children }: { children?: Snippet } = $props();
	const combobox = getComboboxContext();
	const { properties } = createComboboxLabel({ combobox });
</script>

<label {...properties}>
	{#if children}
		{@render children()}
	{:else}
		{combobox.label}
	{/if}
</label>
