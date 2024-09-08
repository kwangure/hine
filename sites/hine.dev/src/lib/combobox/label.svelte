<script lang="ts">
	import type { Snippet } from 'svelte';
	import { getComboboxContext } from './context';
	import { createComboboxLabel } from './create';

	const { children }: { children?: Snippet } = $props();
	const combobox = getComboboxContext();
	const { properties } = createComboboxLabel({
		combobox,
		get inputId() {
			return combobox.elements.input?.properties.id;
		},
	});
</script>

<label {...properties}>
	{#if children}
		{@render children()}
	{:else}
		{combobox.state.config.label}
	{/if}
</label>
