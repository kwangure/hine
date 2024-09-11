import type { ComboboxBuilder } from './combobox.svelte.js';

export interface CreateComboboxLabelConfig<
	TOptions extends Iterable<any>,
	TFilter,
> {
	combobox: ComboboxBuilder<TOptions, TFilter>;
	inputId: string | undefined;
}

export function createComboboxLabel<TOptions extends Iterable<any>, TFilter>(
	config: CreateComboboxLabelConfig<TOptions, TFilter>,
) {
	const label = {
		properties: {
			get for() {
				return config.inputId;
			},
		},
	};

	config.combobox.operations.registerElement('label', label);

	return label;
}
