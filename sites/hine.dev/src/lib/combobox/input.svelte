<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { getComboboxContext } from './context';
	import { createComboboxInput } from './create';

	type InputProps = Omit<HTMLInputAttributes, keyof typeof properties>;

	const { ...attributes }: InputProps = $props();
	const combobox = getComboboxContext();
	const { action, properties } = createComboboxInput({
		combobox,
		get listboxId() {
			return combobox.elements.listbox?.properties.id;
		},
	});
</script>

<input {...attributes} {...properties} use:action />

<style>
	input {
		background-color: transparent;
		border: none;
		outline: 0;
		padding-block: var(--st-size-1);
		padding-inline: 12px var(--st-size-2);
	}
</style>
