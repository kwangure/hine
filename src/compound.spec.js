import { beforeEach, describe, expect, it } from 'vitest';
import { AtomicState } from './atomic.js';
import { CompoundState } from './compound.js';

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
		});

		it('throws on unresolved dispatch', () => {
			expect(() => machine.dispatch('to2'))
				.toThrow('Attempted dispatch before resolving state');
		});

		it('sets initial state', () => {
			machine.resolve().start();
			expect(machine.state?.name).toBe('state1');
		});

		it('transitions on dispatch', () => {
			machine.resolve().start();
			machine.dispatch('to2');
			expect(machine.state?.name).toBe('state2');
			machine.dispatch('to1');
			expect(machine.state?.name).toBe('state1');
			machine.dispatch('to2');
			expect(machine.state?.name).toBe('state2');
		});

		it('ignores invalid events', () => {
			machine.resolve().start();
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
			})
				.resolve()
				.start();
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
});
