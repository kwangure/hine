import type { ComboboxBuilder, ComboboxOption } from './combobox.svelte.js';

export interface ComboboxListboxItemState<T> {
	operations: {
		selectItem(value: T): void;
	};
}

export interface CreateComboboxListboxItemConfig<
	TOptions extends Iterable<any>,
	TFilter,
> {
	combobox: ComboboxBuilder<TOptions, TFilter>;
	value: ComboboxOption<TOptions, TFilter>;
}

export function createListboxItem<TOptions extends Iterable<any>, TFilter>(
	listboxItemConfig: CreateComboboxListboxItemConfig<TOptions, TFilter>,
) {
	const { operations, state } = listboxItemConfig.combobox;
	const isActive = $derived(
		Object.is(listboxItemConfig.value, state.activeItem),
	);

	return {
		properties: {
			get ['aria-selected']() {
				return isActive;
			},
			role: 'option',
			onclick() {
				operations.closeAndSetValueToItem(listboxItemConfig.value);
			},
			get ['data-active-item']() {
				return isActive || undefined;
			},
			get ['data-focus-visible']() {
				return isActive || undefined;
			},
		},
	};
}
