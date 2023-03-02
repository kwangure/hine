import { describe, expect, it } from 'vitest';
import { AtomicState } from '../../src/atomic.js';
import { CompoundState } from '../../src/compound.js';

describe('actions', () => {
	it('runs initial entry then transient actions', () => {
		/** @type {string[]} */
		const log = [];
		new CompoundState({
			name: 's0',
			actions: {
				always0() {
					log.push('always0');
				},
				entry0() {
					log.push('entry0');
				},
			},
			always: [{
				actions: ['always0'],
			}],
			entry: [{
				actions: ['entry0'],
			}],
			states: {
				s1: new CompoundState({
					actions: {
						always1() {
							log.push('always1');
						},
						entry1() {
							log.push('entry1');
						},
					},
					always: [{
						actions: ['always1'],
					}],
					entry: [{
						actions: ['entry1'],
					}],
					states: {
						s2: new AtomicState({
							actions: {
								always2() {
									log.push('always2');
								},
								entry2() {
									log.push('entry2');
								},
							},
							always: [{
								actions: ['always2'],
							}],
							entry: [{
								actions: ['entry2'],
							}],
						}),
					},
				}),
			},
		})
			.resolve()
			.start();
		expect(log).toEqual(['entry0', 'always0', 'entry1', 'always1', 'entry2', 'always2']);
	});
});
