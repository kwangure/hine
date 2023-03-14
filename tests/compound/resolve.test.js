import { AtomicState, CompoundState } from 'src';
import { describe, expect, it } from 'vitest';

describe('resolve', () => {
	it('returns a reference to the machine', () => {
		const machine = new CompoundState({
			states: {
				s1: new AtomicState(),
			},
		});
		expect(machine.resolve()).toBe(machine);
	});
	it('sets the name', () => {
		const machine = new CompoundState({
			states: {
				s1: new AtomicState(),
			},
		});
		machine.resolve({ name: 'john' });
		expect(machine.name).toBe('john');
	});
	it('does not override configured name', () => {
		const machine = new CompoundState({
			name: 'machine',
			states: {
				s1: new AtomicState(),
			},
		});
		machine.resolve({ name: 'john' });
		expect(machine.name).toBe('machine');
	});
	it('does not override configured name', () => {
		const machine = new CompoundState();
		machine.configure({
			name: 'machine',
			states: {
				s1: new AtomicState(),
			},
		});
		machine.resolve({ name: 'john' });
		expect(machine.name).toBe('machine');
	});
	it('does not override configured name', () => {
		const machine = new CompoundState({
			states: {
				s1: new CompoundState({
					name: 'nots1',
					states: {
						s11: new AtomicState(),
					},
				}),
			},
		})
			.resolve()
			.start();
		expect(machine.state?.name).toBe('nots1');
	});
	it('sets machine actions', () => {
		let value = '';
		const machine = new CompoundState({
			entry: [{
				actions: ['run'],
			}],
			states: {
				s1: new AtomicState(),
			},
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
		const machine = new CompoundState({
			actions: {
				run() {
					value = 'run';
				},
			},
			entry: [{
				actions: ['run'],
			}],
			states: {
				s1: new AtomicState(),
			},
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
	it('sets machine conditions', () => {
		let value = '';
		const machine = new CompoundState({
			actions: {
				run() {
					value = 'run';
				},
			},
			entry: [{
				actions: ['run'],
			}],
			states: {
				s1: new AtomicState(),
			},
		});

		machine.resolve({
			conditions: {
				shouldRun() {
					return false;
				},
			},
		}).start();

		expect(value).toBe('run');
	});
	it('does not override existing machine conditions', () => {
		let value = '';
		const machine = new CompoundState({
			actions: {
				run() {
					value = 'run';
				},
			},
			entry: [{
				actions: ['run'],
			}],
			states: {
				s1: new AtomicState(),
			},
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
