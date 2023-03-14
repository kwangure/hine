import { describe, expect, it } from 'vitest';
import { AtomicState } from 'src';

describe('resolve', () => {
	it('returns a reference to the machine', () => {
		const machine = new AtomicState();
		expect(machine.resolve()).toBe(machine);
	});
	it('sets the name', () => {
		const machine = new AtomicState();
		machine.resolve({ name: 'john' });
		expect(machine.name).toBe('john');
	});
	it('does not override configured name', () => {
		const machine = new AtomicState({
			name: 'machine',
		});
		machine.resolve({ name: 'john' });
		expect(machine.name).toBe('machine');
	});
	it('does not override configured name', () => {
		const machine = new AtomicState();
		machine.configure({
			name: 'machine',
		});
		machine.resolve({ name: 'john' });
		expect(machine.name).toBe('machine');
	});
	it('sets machine actions', () => {
		let value = '';
		const machine = new AtomicState({
			entry: [{
				actions: ['run'],
			}],
		});

		machine.resolve({
			actions: {
				run() {
					value = 'run';
				},
			},
		}).start();

		expect(value).toBe('run');
	});
	it('does not override existing machine actions', () => {
		let value = '';
		const machine = new AtomicState({
			actions: {
				run() {
					value = 'run';
				},
			},
			entry: [{
				actions: ['run'],
			}],
		});

		machine.resolve({
			actions: {
				run() {
					value = 'notrun';
				},
			},
		}).start();

		expect(value).toBe('run');
	});
});
