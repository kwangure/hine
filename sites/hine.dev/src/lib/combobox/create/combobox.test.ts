import { beforeEach, describe, expect, it } from 'vitest';
import {
	createCombobox,
	type ComboboxBuilder,
	type ComboboxFilterArg,
} from './combobox.svelte.js';
import { createComboboxInput } from './input.svelte.js';
import { createComboboxListbox } from './listbox.svelte.js';

describe('combobox', () => {
	type Filter = ({
		elements,
		state,
	}: ComboboxFilterArg<string[]>) => string[] | undefined;
	let combobox: ComboboxBuilder<string[], Filter>;
	let input: ReturnType<typeof createComboboxInput>;
	let listbox: ReturnType<typeof createComboboxListbox>;
	beforeEach(() => {
		combobox = createCombobox({
			filter({ elements, state }) {
				const inputValue = elements.input?.state.value ?? '';

				return state.config.options?.filter((option) =>
					option.toLowerCase().startsWith(inputValue.toLowerCase()),
				);
			},
			label: 'Favorite Fruit',
			options: ['Apple', 'Banana', 'Blueberry', 'Boysenberry', 'Cherry'],
			setInputValue: (selectedValue) => selectedValue,
		});
		listbox = createComboboxListbox({ combobox });
		input = createComboboxInput({
			combobox,
			get listboxId() {
				return listbox.properties.id;
			},
		});
	});

	describe('When focus is on the input', () => {
		it('ArrowDown opens popup and moves focus to first focusable element', () => {
			const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
			input.properties.onkeydown(event);
			expect(combobox.state.isOpen).toBe(true);
			expect(combobox.state.activeItem).toBe('Apple');
			expect(combobox.state.visualFocus).toBe('listbox');
		});

		it('ArrowUp opens popup and places focus on the last focusable element', () => {
			const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
			input.properties.onkeydown(event);
			expect(combobox.state.isOpen).toBe(true);
			expect(combobox.state.activeItem).toBe('Cherry');
			expect(combobox.state.visualFocus).toBe('listbox');
		});

		it('Enter accepts the autocomplete suggestion if one is selected', () => {
			combobox.operations.open();
			expect(combobox.state.visualFocus).toBe('input');
			const event = new KeyboardEvent('keydown', { key: 'Enter' });
			input.properties.onkeydown(event);
			expect(combobox.state.value).toBe(undefined);
			expect(combobox.state.isOpen).toBe(false);
			expect(combobox.state.visualFocus).toBe('input');
		});

		it('Alt+ArrowDown displays the popup without moving focus', () => {
			expect(combobox.state.visualFocus).toBe('input');
			const event = new KeyboardEvent('keydown', {
				key: 'ArrowDown',
				altKey: true,
			});
			input.properties.onkeydown(event);
			expect(combobox.state.isOpen).toBe(true);
			expect(combobox.state.activeItem).toBeUndefined();
			expect(combobox.state.visualFocus).toBe('input');
		});

		it('Alt+ArrowUp closes the popup and returns focus to the combobox', () => {
			combobox.operations.openAndSetFirstItemActive();
			expect(combobox.state.visualFocus).toBe('listbox');
			const event = new KeyboardEvent('keydown', {
				key: 'ArrowUp',
				altKey: true,
			});
			input.properties.onkeydown(event);
			expect(combobox.state.isOpen).toBe(false);
			expect(combobox.state.visualFocus).toBe('input');
		});
	});

	describe('When focus is on the listbox popup', () => {
		beforeEach(() => {
			combobox.operations.openAndSetFirstItemActive();
		});

		it('Enter accepts the focused option', () => {
			const event = new KeyboardEvent('keydown', { key: 'Enter' });
			input.properties.onkeydown(event);
			expect(combobox.state.value).toBe('Apple');
			expect(combobox.state.isOpen).toBe(false);
		});

		it('Escape closes the popup and returns focus to the combobox', () => {
			expect(combobox.state.visualFocus).toBe('listbox');
			const event = new KeyboardEvent('keydown', { key: 'Escape' });
			input.properties.onkeydown(event);
			expect(combobox.state.value).toBe(undefined);
			expect(combobox.state.isOpen).toBe(false);
			expect(combobox.state.visualFocus).toBe('input');
		});

		it('ArrowDown moves focus to and selects the next option', () => {
			const event = new KeyboardEvent('keydown', { key: 'ArrowDown' });
			input.properties.onkeydown(event);
			expect(combobox.state.activeItem).toBe('Banana');
		});

		it('ArrowUp moves focus to and selects the previous option', () => {
			combobox.operations.setNextActiveItem();
			expect(combobox.state.activeItem).toBe('Banana');
			const event = new KeyboardEvent('keydown', { key: 'ArrowUp' });
			input.properties.onkeydown(event);
			expect(combobox.state.activeItem).toBe('Apple');
		});

		it('Backspace returns focus to the combobox', () => {
			expect(combobox.state.visualFocus).toBe('listbox');
			const backspaceEvent = new KeyboardEvent('keydown', {
				key: 'Backspace',
			});

			input.state.value = 'Appl';
			input.properties.onkeydown(backspaceEvent);
			input.properties.onkeyup(backspaceEvent);

			expect(combobox.state.visualFocus).toBe('input');
			expect(input.state.value).toBe('Appl');
		});

		it('Delete returns focus to the combobox', () => {
			expect(combobox.state.visualFocus).toBe('listbox');
			const deleteEvent = new KeyboardEvent('keydown', {
				key: 'Delete',
			});

			input.state.value = 'Appl';
			input.properties.onkeydown(deleteEvent);
			input.properties.onkeyup(deleteEvent);

			expect(combobox.state.visualFocus).toBe('input');
			expect(input.state.value).toBe('Appl');
		});
	});
});
