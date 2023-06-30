import { createBeforeMonitor, createBeforeState } from './before.js';
import { createBlockMonitor, createBlockState } from './block/block.js';
import { createRawMonitor, createRawState } from './raw.js';
import { h } from 'hine';

/**
 * @param {import('../../types.js').ParserContext} context
 */
export function createMustacheState(context) {
	return h.compound({
		conditions: {
			isColon: h.condition(({ value }) => value === ':'),
			isDone: h.condition(({ ownerState }) =>
				Boolean(ownerState?.matches('mustache.done')),
			),
			isHashTag: h.condition(({ value }) => value === '#'),
		},
		on: {
			CHARACTER: [
				{
					transitionTo: 'fragment',
					condition: 'isDone',
				},
			],
		},
		states: {
			before: createBeforeState(),
			block: createBlockState(context),
			raw: createRawState(context),
			done: h.atomic(),
		},
	});
}

/**
 * @param {import('../../types.js').ParserContext} context
 */
export function createMustacheMonitor(context) {
	return {
		states: {
			before: createBeforeMonitor(context),
			block: createBlockMonitor(context),
			raw: createRawMonitor(context),
		},
	};
}
