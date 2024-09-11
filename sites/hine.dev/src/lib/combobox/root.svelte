<script lang="ts" generics="TOptions extends Iterable<any>, TFilter">
	/* eslint-disable no-unused-vars, no-undef */
	import type { Snippet } from 'svelte';
	import { createComboboxRoot } from './create/root.svelte';
	import { setComboboxContext } from './context';
	import type {
		ComboboxOption,
		InferIterableValue,
	} from './create/combobox.svelte';

	const {
		children,
		filter,
		hasInputCompletion,
		label,
		onchange,
		options,
		setInputValue,
	}: {
		children: Snippet<[typeof combobox]>;
		filter?: TFilter;
		hasInputCompletion?: false | undefined;
		label: string;
		onchange?: (
			value: ComboboxOption<TOptions, TFilter> | undefined,
		) => void;
		options?: TOptions;
		setInputValue?: (
			selectedValue: TFilter extends (...args: any) => any
				? InferIterableValue<ReturnType<TFilter>>
				: InferIterableValue<TOptions>,
		) => string;
	} = $props();
	const combobox = setComboboxContext<TOptions, TFilter>({
		filter,
		hasInputCompletion,
		label,
		options,
		onchange,
		setInputValue,
	});
	const { action, properties } = createComboboxRoot(combobox);
</script>

<div class="root" {...properties} use:action>
	{@render children(combobox)}
</div>

<style>
	.root {
		display: flex;
		flex-direction: column;
	}
</style>
