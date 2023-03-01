import { beforeEach, describe, expect, it } from 'vitest';
import { AtomicState } from './atomic.js';
import { CompoundState } from './compound.js';

const toPojo = (/** @type {any} */ obj) => JSON.parse(JSON.stringify(obj));

describe('htstate', () => {
	describe('basics', () => {
		/** @type {CompoundState} */
		let machine;
		beforeEach(() => {
			machine = new CompoundState();
			machine.configure({
				states: {
					state1: new AtomicState({
						on: {
							to2: [{
								transitionTo: 'state2',
							}],
						},
					}),
					state2: new AtomicState({
						on: {
							to1: [{
								transitionTo: 'state1',
							}],
						},
					}),
				},
			});
			machine.resolve();
		});

		it('sets initial state', () => {
			expect(machine.state?.name).toBe('state1');
		});

		it('transitions on dispatch', () => {
			machine.dispatch('to2');
			expect(machine.state?.name).toBe('state2');
			machine.dispatch('to1');
			expect(machine.state?.name).toBe('state1');
			machine.dispatch('to2');
			expect(machine.state?.name).toBe('state2');
		});

		it('ignores invalid events', () => {
			machine.dispatch('random');
			expect(machine.state?.name).toBe('state1');
		});
	});

	describe('missing actions', () => {
		/** @type {CompoundState} */
		let machine;
		beforeEach(() => {
			machine = new CompoundState();
		});
		it('throws on missing entry actions', () => {
			expect(() => machine.configure({
				states: {
					first: new CompoundState({
						entry: [{
							actions: ['missing'],
						}],
					}),
				},
			}).resolve()).toThrow('\'missing\'');
		});

		it('throws on missing exit actions', () => {
			expect(() => machine.configure({
				states: {
					first: new CompoundState({
						exit: [{
							actions: ['missing'],
						}],
					}),
				},
			}).resolve()).toThrow('\'missing\'');
		});

		it('throws on missing transient actions', () => {
			expect(() => machine.configure({
				states: {
					first: new CompoundState({
						always: [{
							actions: ['missing'],
						}],
					}),
				},
			}).resolve()).toThrow('\'missing\'');
		});
	});

	describe('actions', () => {
		/** @type {CompoundState} */
		let machine;
		/** @type {string[]} */
		let actions;
		beforeEach(() => {
			actions = [];
			machine = new CompoundState();
			machine.configure({
				states: {
					first: new AtomicState({
						always: [{
							actions: ['always1'],
						}],
						entry: [{
							actions: ['entry1'],
						}],
						exit: [{
							actions: ['exit1'],
						}],
						on: {
							event: [{
								transitionTo: 'second',
								actions: ['transition1'],
							}],
						},
						actions: {
							always1() {
								actions.push('always1');
							},
							entry1() {
								actions.push('entry1');
							},
							exit1() {
								actions.push('exit1');
							},
							transition1() {
								actions.push('transition1');
							},
						},
					}),
					second: new AtomicState({
						always: [{
							actions: ['always2'],
						}],
						entry: [{
							actions: ['entry2'],
						}],
						exit: [{
							actions: ['exit2'],
						}],
						on: {
							event: [{
								transitionTo: 'first',
								actions: ['transition2'],
							}],
						},
						actions: {
							always2() {
								actions.push('always2');
							},
							entry2() {
								actions.push('entry2');
							},
							exit2() {
								actions.push('exit2');
							},
							transition2() {
								actions.push('transition2');
							},
						},
					}),
				},
			}).resolve();
		});

		it('runs initial entry then transient actions', () => {
			expect(actions).toEqual(['entry1', 'always1']);
		});

		it('runs exit, transition, entry then transient actions', () => {
			actions = [];
			machine.dispatch('event');
			expect(actions).toEqual(['exit1', 'transition1', 'entry2', 'always2']);

			actions = [];
			machine.dispatch('event');
			expect(actions).toEqual(['exit2', 'transition2', 'entry1', 'always1']);
		});
	});

	describe('transitions', () => {
		/** @type {CompoundState} */
		let machine;
		/** @type {string[]} */
		let transitions;
		beforeEach(() => {
			transitions = [];
			machine = new CompoundState();
			machine.configure({
				actions: {
					always1() {
						transitions.push({
							...toPojo(this.transition),
							action: 'always1',
						});
					},
					entry1() {
						transitions.push({
							...toPojo(this.transition),
							action: 'entry1',
						});
					},
					exit1() {
						transitions.push({
							...toPojo(this.transition),
							action: 'exit1',
						});
					},
					transition1() {
						transitions.push({
							...toPojo(this.transition),
							action: 'transition1',
						});
					},
					always2() {
						transitions.push({
							...toPojo(this.transition),
							action: 'always2',
						});
					},
					entry2() {
						transitions.push({
							...toPojo(this.transition),
							action: 'entry2',
						});
					},
					exit2() {
						transitions.push({
							...toPojo(this.transition),
							action: 'exit2',
						});
					},
					transition2() {
						transitions.push({
							...toPojo(this.transition),
							action: 'transition2',
						});
					},
				},
				states: {
					first: new AtomicState({
						always: [{
							actions: ['always1'],
						}],
						entry: [{
							actions: ['entry1'],
						}],
						exit: [{
							actions: ['exit1'],
						}],
						on: {
							event: [{
								transitionTo: 'second',
								actions: ['transition1'],
							}],
						},
						actions: {
							always1() {
								transitions.push({
									...toPojo(this.transition),
									action: 'always1',
								});
							},
							entry1() {
								transitions.push({
									...toPojo(this.transition),
									action: 'entry1',
								});
							},
							exit1() {
								transitions.push({
									...toPojo(this.transition),
									action: 'exit1',
								});
							},
							transition1() {
								transitions.push({
									...toPojo(this.transition),
									action: 'transition1',
								});
							},
						},
					}),
					second: new AtomicState({
						always: [{
							actions: ['always2'],
						}],
						entry: [{
							actions: ['entry2'],
						}],
						exit: [{
							actions: ['exit2'],
						}],
						on: {
							event: [{
								transitionTo: 'first',
								actions: ['transition2'],
							}],
						},
						actions: {
							always2() {
								transitions.push({
									...toPojo(this.transition),
									action: 'always2',
								});
							},
							entry2() {
								transitions.push({
									...toPojo(this.transition),
									action: 'entry2',
								});
							},
							exit2() {
								transitions.push({
									...toPojo(this.transition),
									action: 'exit2',
								});
							},
							transition2() {
								transitions.push({
									...toPojo(this.transition),
									action: 'transition2',
								});
							},
						},
					}),
				},
			}).resolve();
		});

		it('runs initial entry then transient actions', () => {
			expect(transitions).toEqual([
				{
					action: 'entry1',
					active: true,
					from: null,
					to: {
						name: 'first',
						transition: {
							active: false,
						},
					},
				},
				{
					action: 'always1',
					active: true,
					from: null,
					to: {
						name: 'first',
						transition: {
							active: false,
						},
					},
				},
			]);
			expect(machine.toJSON().transition).toEqual({
				active: false,
				from: undefined,
				to: {
					name: 'first',
					transition: {
						active: false,
						from: undefined,
						to: undefined,
					},
				},
			});
		});

		it('runs exit, transition, entry then transient actions', () => {
			expect(machine.toJSON().transition).toEqual({
				active: false,
				from: undefined,
				to: {
					name: 'first',
					transition: {
						active: false,
						from: undefined,
						to: undefined,
					},
				},
			});

			transitions = [];
			machine.dispatch('event');
			expect(transitions).toEqual([
				{
					action: 'exit1',
					active: true,
					from: {
						name: 'first',
						transition: {
							active: false,
						},
					},
					to: {
						name: 'second',
						transition: {
							active: false,
						},
					},
				},
				{
					action: 'transition1',
					active: true,
					from: {
						name: 'first',
						transition: {
							active: false,
						},
					},
					to: {
						name: 'second',
						transition: {
							active: false,
						},
					},
				},
				{
					action: 'entry2',
					active: true,
					from: {
						name: 'first',
						transition: {
							active: false,
						},
					},
					to: {
						name: 'second',
						transition: {
							active: false,
						},
					},
				},
				{
					action: 'always2',
					active: true,
					from: {
						name: 'first',
						transition: {
							active: false,
						},
					},
					to: {
						name: 'second',
						transition: {
							active: false,
						},
					},
				},
			]);
			expect(machine.toJSON().transition).toEqual({
				active: false,
				from: {
					name: 'first',
					transition: {
						active: false,
						from: undefined,
						to: undefined,
					},
				},
				to: {
					name: 'second',
					transition: {
						active: false,
						from: undefined,
						to: undefined,
					},
				},
			});

			transitions = [];
			machine.dispatch('event');
			expect(transitions).toEqual([
				{
					action: 'exit2',
					active: true,
					from: {
						name: 'second',
						transition: {
							active: false,
						},
					},
					to: {
						name: 'first',
						transition: {
							active: false,
						},
					},
				},
				{
					action: 'transition2',
					active: true,
					from: {
						name: 'second',
						transition: {
							active: false,
						},
					},
					to: {
						name: 'first',
						transition: {
							active: false,
						},
					},
				},
				{
					action: 'entry1',
					active: true,
					from: {
						name: 'second',
						transition: {
							active: false,
						},
					},
					to: {
						name: 'first',
						transition: {
							active: false,
						},
					},
				},
				{
					action: 'always1',
					active: true,
					from: {
						name: 'second',
						transition: {
							active: false,
						},
					},
					to: {
						name: 'first',
						transition: {
							active: false,
						},
					},
				},
			]);
			expect(machine.toJSON().transition).toEqual({
				active: false,
				from: {
					name: 'second',
					transition: {
						active: false,
						from: undefined,
						to: undefined,
					},
				},
				to: {
					name: 'first',
					transition: {
						active: false,
						from: undefined,
						to: undefined,
					},
				},
			});
		});
	});

	describe('conditions', () => {
		/** @type {CompoundState} */
		let machine;
		/** @type {string[]} */
		let actions;
		beforeEach(() => {
			actions = [];
			machine = new CompoundState();
			machine.configure({
				states: {
					current: new AtomicState({
						always: [
							{
								actions: ['always'],
								condition: 'run',
							},
							{
								actions: ['always'],
							},
							{
								actions: ['ignore'],
								condition: 'ignore',
							},
						],
						entry: [
							{
								actions: ['entry'],
								condition: 'run',
							},
							{
								actions: ['entry'],
							},
							{
								actions: ['ignore'],
								condition: 'ignore',
							},
						],
						exit: [
							{
								actions: ['exit'],
								condition: 'run',
							},
							{
								actions: ['exit'],
							},
							{
								actions: ['ignore'],
								condition: 'ignore',
							},
						],
						on: {
							ignored: [
								{
									transitionTo: 'other',
									condition: 'ignore',
									actions: ['transition'],
								},
							],
							transition: [
								{
									transitionTo: 'other',
									actions: ['transition'],
								},
							],
						},
						actions: {
							ignore() {
								actions.push('ignore');
							},
							always() {
								actions.push('always');
							},
							entry() {
								actions.push('entry');
							},
							exit() {
								actions.push('exit');
							},
							transition() {
								actions.push('transition');
							},
						},
						conditions: {
							run() {
								return true;
							},
							ignore() {
								return false;
							},
						},
					}),
					other: new AtomicState(),
				},
			}).resolve();
		});

		it('ignores initial entry then transient actions', () => {
			expect(actions).toEqual(['entry', 'entry', 'always', 'always']);
		});

		it('ignores exit, transition, entry and transient actions', () => {
			actions = [];
			machine.dispatch('ignored');
			expect(machine.state?.name).toEqual('current');
			expect(actions).toEqual(['always', 'always']);

			actions = [];
			machine.dispatch('transition');
			expect(machine.state?.name).toEqual('other');
			expect(actions).toEqual(['exit', 'exit', 'transition']);
		});
	});

	it('always runs transient actions', () => {
		const machine = new CompoundState();
		/** @type {number} */
		let alwaysCount = 0;
		machine.configure({
			states: {
				current: new AtomicState({
					always: [{
						actions: ['always'],
					}],
					actions: {
						always() {
							alwaysCount++;
						},
					},
				}),
			},
		}).resolve();
		expect(alwaysCount).toBe(1);

		machine.dispatch('non-existent');
		expect(alwaysCount).toBe(2);
	});
});
