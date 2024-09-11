import { getContext, setContext } from 'svelte';
import {
	createCombobox,
	type CreateCombmboxConfig,
} from './create/combobox.svelte.js';

export const comboboxContextKey = Symbol('combobox');

export type ComboboxBuilder<
	TOptions extends Iterable<any>,
	TFilter,
> = ReturnType<typeof createCombobox<TOptions, TFilter>>;

export function setComboboxContext<TOptions extends Iterable<any>, TFilter>(
	options: CreateCombmboxConfig<TOptions, TFilter>,
) {
	const combobox = createCombobox<TOptions, TFilter>(options);
	setContext(comboboxContextKey, combobox);
	return combobox;
}

export function getComboboxContext<TOptions extends Iterable<any>, TFilter>() {
	const combobox = getContext(comboboxContextKey);
	if (!combobox) {
		throw new Error(
			'Combobox context not found. Wrap combobox child in a root element.',
		);
	}
	return combobox as ComboboxBuilder<TOptions, TFilter>;
}
