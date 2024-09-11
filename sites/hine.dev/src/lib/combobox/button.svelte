<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getComboboxContext } from './context';
	import { createComboboxButton } from './create';

	type ButtonProps = Omit<HTMLButtonAttributes, keyof typeof properties>;

	const { ...attributes }: ButtonProps = $props();
	const combobox = getComboboxContext();
	const { properties } = createComboboxButton({
		combobox,
		get listboxId() {
			return combobox.elements.listbox?.properties.id;
		},
		get label() {
			return combobox.state.config.label;
		},
	});
</script>

<button {...attributes} {...properties}>
	<span aria-hidden="true" style="padding: 0 2px;">▼</span>
</button>

<style>
	:global(div:hover):has(> button) button,
	:global(div:focus-within):has(> button) button {
		--_color-dark: var(--st-color-preference-dark) inherit;
		color: var(--_color-dark, hsl(225deg 100% 55%));
		--_background-color-dark: var(--st-color-preference-dark)
			hsl(225deg 100% 60%);
		background-color: var(--_background-color-dark, hsl(215deg 100% 90%));
		transition:
			background-color 0.25s ease,
			color 0.25s ease;
	}
	button {
		align-items: center;
		justify-content: center;
		background-color: transparent;
		color: inherit;
		display: flex;
		height: var(--st-size-8);
		width: var(--st-size-8);
		border-radius: 0 var(--st-size-0_5) var(--st-size-0_5) 0;
		user-select: none;
	}
</style>
