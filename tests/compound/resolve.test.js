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
	it('sets nested name name', () => {
		const machine = new CompoundState({
			states: {
				s1: new CompoundState({
					states: {
						s11: new AtomicState(),
					},
				}),
			},
		})
			.resolve()
			.start();
		expect(machine.state?.name).toBe('s1');
		expect(/** @type {CompoundState | null} */(machine.state)?.state?.name).toBe('s11');
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
				run() {},
			},
			entry: [{
				condition: 'shouldRun',
				actions: ['run'],
			}],
			states: {
				s1: new AtomicState(),
			},
		});

		machine.resolve({
			conditions: {
				shouldRun() {
					value = 'condition';
					return true;
				},
			},
		}).start();

		expect(value).toBe('condition');
	});
	it('does not override existing machine conditions', () => {
		let value = '';
		const machine = new CompoundState({
			conditions: {
				shouldRun() {
					value = 'condition';
					return true;
				},
			},
			actions: {
				run() {},
			},
			entry: [{
				condition: 'shouldRun',
				actions: ['run'],
			}],
			states: {
				s1: new AtomicState(),
			},
		});

		machine.resolve({
			conditions: {
				shouldRun() {
					value = 'notcondition';
					return true;
				},
			},
		}).start();

		expect(value).toBe('condition');
	});
});
