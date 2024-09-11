import { uid } from 'uid';
import type { ComboboxBuilder } from './combobox.svelte.js';

export interface CreateComboboxListboxConfig<
	TOptions extends Iterable<any>,
	TFilter,
> {
	combobox: ComboboxBuilder<TOptions, TFilter>;
}

export function createComboboxListbox<TOptions extends Iterable<any>, TFilter>(
	listboxConfig: CreateComboboxListboxConfig<TOptions, TFilter>,
) {
	const { operations, state } = listboxConfig.combobox;
	const listbox = {
		properties: {
			get ['aria-label']() {
				return state.config.label;
			},
			id: uid(),
			role: 'listbox',
		},
	};

	operations.registerElement('listbox', listbox);

	return listbox;
}
