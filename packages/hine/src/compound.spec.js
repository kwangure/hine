import { beforeEach, describe, expect, it } from 'vitest';
import { Action } from './action.js';
import { AtomicState } from './atomic.js';
import { CompoundState } from './compound.js';
import { Condition } from './condition.js';

describe('htstate', () => {
	describe('missing actions', () => {
		it('throws on missing entry actions', () => {
			const state = new CompoundState({
				states: {
					first: new CompoundState({
						states: {
							s1: new AtomicState(),
						},
					}),
				},
			});
			state.monitor({
				entry: [
					{
						actions: ['missing'],
					},
				],
			});
			expect(() => state.start()).toThrow("'missing'");
		});

		it('throws on missing exit actions', () => {
			const state = new CompoundState({
				states: {
					first: new CompoundState({
						states: {
							s1: new AtomicState(),
						},
					}),
				},
			});
			state.monitor({
				exit: [
					{
						actions: ['missing'],
					},
				],
			});
			expect(() => state.start()).toThrow("'missing'");
		});

		it('throws on missing transient actions', () => {
			expect(() =>
				new CompoundState({
					states: {
						first: new CompoundState({
							always: [
								{
									actions: ['missing'],
								},
							],
							states: {
								s1: new AtomicState(),
							},
						}),
					},
				}).start(),
			).toThrow("'missing'");
		});
	});

	describe('conditions', () => {
		/** @type {CompoundState} */
		let machine;
		/** @type {string[]} */
		let actions;
		beforeEach(() => {
			actions = [];
			machine = new CompoundState({
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
					}),
					other: new AtomicState(),
				},
			});
			machine.monitor({
				states: {
					current: {
						actions: {
							ignore: new Action({
								run() {
									actions.push('ignore');
								},
							}),
							always: new Action({
								run() {
									actions.push('always');
								},
							}),
							entry: new Action({
								run() {
									actions.push('entry');
								},
							}),
							exit: new Action({
								run() {
									actions.push('exit');
								},
							}),
							transition: new Action({
								run() {
									actions.push('transition');
								},
							}),
						},
						conditions: {
							run: new Condition({
								run() {
									return true;
								},
							}),
							ignore: new Condition({
								run() {
									return false;
								},
							}),
						},
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
					},
				},
			});
			machine.start();
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
