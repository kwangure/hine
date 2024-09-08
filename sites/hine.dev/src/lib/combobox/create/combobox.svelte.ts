import type { createComboboxButton } from './button.svelte.js';
import type { createComboboxInput } from './input.svelte.js';
import type { createComboboxLabel } from './label.svelte.js';
import type { createComboboxListbox } from './listbox.svelte.js';

export interface CreateCombmboxConfig<
	TOptions extends Iterable<any> | undefined,
	TFilter,
> {
	filter?: TFilter | undefined;
	hasInputCompletion?: false | undefined;
	label: string;
	onchange?: (
		selectedValue: ComboboxOption<TOptions, TFilter> | undefined,
	) => void;
	options?: TOptions | undefined;
	setInputValue?:
		| ((selectedValue: ComboboxOption<TOptions, TFilter>) => string)
		| undefined;
}

export type InferIterableValue<T> = T extends Iterable<infer U> ? U : never;

export type ComboboxOption<TOptions, TFilter> = TFilter extends (
	...args: any
) => any
	? InferIterableValue<ReturnType<TFilter>>
	: InferIterableValue<TOptions>;

export interface ComboboxElements {
	button: ReturnType<typeof createComboboxButton>;
	input: ReturnType<typeof createComboboxInput>;
	label: ReturnType<typeof createComboboxLabel>;
	listbox: ReturnType<typeof createComboboxListbox>;
}

export interface ComboboxOperations<TOptions, TFilter> {
	clear(): void;
	close(): void;
	closeAndSetValueToActiveItem(): void;
	closeAndSetValueToItem(v: ComboboxOption<TOptions, TFilter>): void;
	open(): void;
	openAndSetFirstItemActive(): void;
	openAndSetLastItemActive(): void;
	setVisualFocusInputAndClearActiveItem(): void;
	setNextActiveItem(): void;
	setPreviousActiveItem(): void;
	setValueToItem(v: ComboboxOption<TOptions, TFilter>): void;
	registerElement<TElement extends keyof ComboboxElements>(
		name: TElement,
		element: ComboboxElements[TElement],
	): void;
}

export interface ComboboxFilterArg<
	TOptions extends Iterable<any> | undefined = undefined,
> {
	elements: Partial<ComboboxElements>;
	state: {
		get config(): {
			hasInputCompletion?: false | undefined;
			label: string;
			options?: TOptions;
		};
		get isOpen(): boolean;
		get visualFocus(): 'listbox' | 'input';
	};
}

export interface ComboboxResolvedConfig<
	TOptions extends Iterable<any> | undefined,
	TFilter,
> {
	filter?: TFilter | undefined;
	hasInputCompletion: false | undefined;
	label: string;
	options: TOptions;
	setInputValue: (selectedValue: ComboboxOption<TOptions, TFilter>) => string;
}

export interface ComboboxBuilder<
	TOptions extends Iterable<any> | undefined,
	TFilter,
> {
	elements: Partial<ComboboxElements>;
	operations: ComboboxOperations<TOptions, TFilter>;
	state: {
		get activeItem(): ComboboxOption<TOptions, TFilter> | undefined;
		get config(): ComboboxResolvedConfig<TOptions, TFilter>;
		get filteredOptions(): TFilter extends (...args: any) => any
			? ReturnType<TFilter>
			: undefined;
		get isOpen(): boolean;
		get value(): ComboboxOption<TOptions, TFilter> | undefined;
		get visualFocus(): 'listbox' | 'input';
	};
}

export function createCombobox<
	TOptions extends Iterable<any> | undefined,
	TFilter,
>(config: CreateCombmboxConfig<TOptions, TFilter>) {
	const resolvedConfig = $derived({
		...config,
		hasInputCompletion: config.hasInputCompletion ?? false,
		filter: config.filter,
		onchange: config.onchange,
		options: config.options,
	} as ComboboxResolvedConfig<TOptions, TFilter>);
	const elements = $state<Partial<ComboboxElements>>({});
	let isOpen = $state(false);
	let value = $state<ComboboxOption<TOptions, TFilter>>();
	let visualFocus = $state<'listbox' | 'input'>('input');
	const filteredOptions = $derived.by((() => {
		if (typeof config.filter !== 'function') {
			return config.options;
		}
		return config.filter({
			elements,
			state: {
				config,
				isOpen,
				visualFocus,
			},
		} as ComboboxFilterArg<TOptions>);
	}) as () => TFilter extends (...args: any) => any
		? ReturnType<TFilter>
		: undefined);
	const activeCollection = $derived([
		...((filteredOptions ? filteredOptions : config.options) as Iterable<
			ComboboxOption<TOptions, TFilter>
		>),
	]);
	let activeItemIndex = $state(-1);
	const activeItem = $derived(activeCollection[activeItemIndex]);
	const operations = {
		clear() {
			activeItemIndex = -1;
			if (elements.input) {
				elements.input.state.value = '';
			}
		},
		close() {
			isOpen = false;
			activeItemIndex = -1;
			visualFocus = 'input';
		},
		closeAndSetValueToActiveItem() {
			if (activeItem) {
				operations.setValueToItem(activeItem);
			}
			operations.close();
		},
		closeAndSetValueToItem(v: ComboboxOption<TOptions, TFilter>) {
			operations.setValueToItem(v);
			operations.close();
		},
		open() {
			isOpen = true;
		},
		openAndSetFirstItemActive() {
			isOpen = true;
			visualFocus = 'listbox';
			activeItemIndex = 0;
		},
		openAndSetLastItemActive() {
			isOpen = true;
			visualFocus = 'listbox';
			activeItemIndex = activeCollection.length - 1;
		},
		setVisualFocusInputAndClearActiveItem() {
			visualFocus = 'input';
			activeItemIndex = -1;
		},
		setNextActiveItem() {
			// - Set to: 0,...,activeCollection.length,0,...
			// - For activeCollection[activeCollection.length] i.e. `undefined`, focus is set on the input
			const length = activeCollection.length + 1;
			activeItemIndex = (activeItemIndex + 1) % length;
			visualFocus = 'listbox';
		},
		setPreviousActiveItem() {
			// - Set to: activeCollection.length,...,0,activeCollection.length,...
			// - For activeCollection[activeCollection.length] i.e. `undefined`, focus is set on the input
			const length = activeCollection.length + 1;
			activeItemIndex = (activeItemIndex - 1 + length) % length;
			visualFocus = 'listbox';
		},
		setValueToItem(v: ComboboxOption<TOptions, TFilter>) {
			value = v;
			if (elements.input && config.setInputValue) {
				elements.input.state.value = config.setInputValue(v);
			}
			config.onchange?.(value);
		},
		registerElement<TElement extends keyof ComboboxElements>(
			name: TElement,
			element: ComboboxElements[TElement],
		) {
			elements[name] = element;
		},
	};

	return {
		get elements() {
			return elements;
		},
		operations,
		state: {
			get activeItem() {
				return activeItem;
			},
			get config() {
				return resolvedConfig;
			},
			get filteredOptions() {
				return filteredOptions;
			},
			get isOpen() {
				return isOpen;
			},
			get value() {
				return value;
			},
			get visualFocus() {
				return visualFocus;
			},
		},
	} satisfies ComboboxBuilder<TOptions, TFilter>;
}
