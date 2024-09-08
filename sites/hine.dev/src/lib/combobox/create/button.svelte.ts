import type { ComboboxBuilder } from './combobox.svelte.js';

export interface CreateComboboxButtonConfig<
	TOptions extends Iterable<any>,
	TFilter,
> {
	combobox: ComboboxBuilder<TOptions, TFilter>;
	label: string;
	listboxId: string | undefined;
}

export function createComboboxButton<TOptions extends Iterable<any>, TFilter>(
	config: CreateComboboxButtonConfig<TOptions, TFilter>,
) {
	const { operations, state } = config.combobox;
	const properties = {
		get ['aria-controls']() {
			return config.listboxId;
		},
		get ['aria-expanded']() {
			return state.isOpen;
		},
		get ['aria-label']() {
			return config.label;
		},
		onclick() {
			if (state.isOpen) {
				operations.close();
			} else {
				operations.open();
			}
		},
		tabindex: -1,
		type: 'button' as const,
	};

	const button = {
		properties,
	};

	operations.registerElement('button', button);

	return button;
}
