import type { ComboboxBuilder } from './combobox.svelte.js';
import { uid } from 'uid';

export interface CreateComboboxInputConfig<
	TOptions extends Iterable<any>,
	TFilter,
> {
	combobox: ComboboxBuilder<TOptions, TFilter>;
	listboxId: string | undefined;
}

export function createComboboxInput<TOptions extends Iterable<any>, TFilter>(
	inputConfig: CreateComboboxInputConfig<TOptions, TFilter>,
) {
	const { operations, state } = inputConfig.combobox;
	let element = $state<HTMLInputElement>();
	let value = $state('');

	const keyDownHandlers = {
		[MOD_ALT | KEY_ARROW_DOWN](event: KeyboardEvent) {
			operations.open();
			cancelEvent(event);
		},
		[KEY_ARROW_DOWN](event: KeyboardEvent) {
			if (state.isOpen) {
				operations.setNextActiveItem();
			} else {
				operations.openAndSetFirstItemActive();
			}
			cancelEvent(event);
		},
		[MOD_ALT | KEY_ARROW_UP](event: KeyboardEvent) {
			operations.close();
			cancelEvent(event);
		},
		[KEY_ARROW_UP](event: KeyboardEvent) {
			if (state.isOpen) {
				operations.setPreviousActiveItem();
			} else {
				operations.openAndSetLastItemActive();
			}
			cancelEvent(event);
		},
		[KEY_END]() {
			const length = value.length;
			element?.setSelectionRange(length, length);
		},
		[KEY_ENTER](event: KeyboardEvent) {
			operations.closeAndSetValueToActiveItem();
			cancelEvent(event);
		},
		[KEY_ESC](event: KeyboardEvent) {
			if (state.isOpen) {
				operations.close();
			} else {
				operations.clear();
			}
			cancelEvent(event);
		},
		[KEY_HOME]() {
			element?.setSelectionRange(0, 0);
		},
		[KEY_TAB]() {
			operations.closeAndSetValueToActiveItem();
		},
	};

	const keyUpHandlers = {
		[KEY_BACKSPACE](event: KeyboardEvent) {
			operations.setVisualFocusInputAndClearActiveItem();
			cancelEvent(event);
		},
		[KEY_DELETE](event: KeyboardEvent) {
			operations.setVisualFocusInputAndClearActiveItem();
			cancelEvent(event);
		},
	};

	const properties = {
		get ['aria-autocomplete']() {
			return (
				{
					'00': 'none',
					'01': 'list',
					'10': 'inline',
					'11': 'both',
				} as const
			)[
				`${+Boolean(state.config.hasInputCompletion)}${+Boolean(
					state.config.filter,
				)}` as '00' | '01' | '10' | '11'
			];
		},
		get ['aria-controls']() {
			return inputConfig.listboxId;
		},
		get ['aria-expanded']() {
			return state.isOpen;
		},
		id: uid(),
		onclick() {
			if (state.isOpen) {
				operations.close();
			} else {
				operations.open();
			}
		},
		oninput(event: Event & { currentTarget: HTMLInputElement }) {
			value = event.currentTarget.value;

			if (!state.isOpen && value.length) {
				operations.open();
			}
		},
		onkeydown(event: KeyboardEvent) {
			const handlerKey = eventToHandlerKey(event);
			keyDownHandlers[handlerKey]?.(event);
		},
		onkeyup(event: KeyboardEvent) {
			const handlerKey = eventToHandlerKey(event);
			keyUpHandlers[handlerKey]?.(event);
		},
		role: 'combobox',
		type: 'text' as const,
	};

	const input = {
		action(node: HTMLInputElement) {
			element = node;
		},
		properties,
		state: {
			get element() {
				return element;
			},
			get value() {
				return value;
			},
			set value(v: string) {
				value = v;
				if (element) {
					element.value = v;
					element.setSelectionRange(v.length, v.length);
				}
			},
		},
	};

	operations.registerElement('input', input);

	return input;
}

const MOD_ALT = 1 << 0;
const MOD_CTRL = 1 << 1;
const MOD_SHIFT = 1 << 2;

const KEY_ARROW_DOWN = 1 << 3;
const KEY_ARROW_UP = 1 << 4;
const KEY_BACKSPACE = 1 << 5;
const KEY_DELETE = 1 << 6;
const KEY_END = 1 << 7;
const KEY_ENTER = 1 << 8;
const KEY_ESC = 1 << 9;
const KEY_HOME = 1 << 10;
const KEY_TAB = 1 << 11;

function eventToHandlerKey(event: KeyboardEvent) {
	const { altKey, ctrlKey, shiftKey, key } = event;
	let keyBitset = 0;

	if (altKey) keyBitset |= MOD_ALT;

	if (ctrlKey) keyBitset |= MOD_CTRL;

	if (shiftKey) keyBitset |= MOD_SHIFT;

	if (key === 'ArrowDown') keyBitset |= KEY_ARROW_DOWN;
	if (key === 'Down') keyBitset |= KEY_ARROW_DOWN;

	if (key === 'ArrowUp') keyBitset |= KEY_ARROW_UP;
	if (key === 'Up') keyBitset |= KEY_ARROW_UP;

	if (key === 'Backspace') keyBitset |= KEY_BACKSPACE;

	if (key === 'Delete') keyBitset |= KEY_DELETE;

	if (key === 'End') keyBitset |= KEY_END;

	if (key === 'Enter') keyBitset |= KEY_ENTER;

	if (key === 'Escape') keyBitset |= KEY_ESC;
	if (key === 'Esc') keyBitset |= KEY_ESC;

	if (key === 'Home') keyBitset |= KEY_HOME;

	if (key === 'Tab') keyBitset |= KEY_TAB;

	return keyBitset;
}

function cancelEvent(event: Event) {
	event.stopPropagation();
	event.preventDefault();
}
