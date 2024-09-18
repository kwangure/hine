<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import {
		createComboboxInput,
		getComboboxContext,
	} from '@svelte-thing/builders';

	type ComboboxInputProperties = ReturnType<
		typeof createComboboxInput
	>['properties'];
	type InputProps = Omit<HTMLInputAttributes, keyof ComboboxInputProperties>;

	const { ...attributes }: InputProps = $props();
	const combobox = getComboboxContext();
	const input = createComboboxInput({ combobox });
</script>

<input {...attributes} {...input.properties} use:input.action />

<style>
	input {
		background-color: transparent;
		border: none;
		outline: 0;
		padding-block: var(--st-size-1);
		padding-inline: 12px var(--st-size-2);
	}
</style>
