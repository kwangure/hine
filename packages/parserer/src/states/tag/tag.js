import {
	createAttributeMonitor,
	createAttributeState,
} from './attribute/attribute.js';
import { createEndMonitor, createEndState } from './end/end.js';
import { createNameMonitor, createNameState } from './name.js';
import { createOpenMonitor, createOpenState } from './open.js';
import { createSelfCloseMonitor, createSelfCloseState } from './selfClose.js';
import { h } from 'hine';

/**
 * @param {import('../../types.js').ParserContext} context
 */
export function createTagState(context) {
	return h.compound({
		always: [
			{
				transitionTo: 'fragment',
				condition: 'isDone',
			},
		],
		conditions: {
			isDone: h.condition(({ ownerState }) =>
				Boolean(ownerState?.matches('tag.done')),
			),
		},
		states: {
			open: createOpenState(),
			attribute: createAttributeState(context),
			end: createEndState(),
			name: createNameState(),
			selfClose: createSelfCloseState(),
			done: h.atomic(),
		},
		on: {
			RESET: [
				{
					transitionTo: 'start',
				},
			],
		},
	});
}

/**
 * @param {import('../../types.js').ParserContext} context
 */
export function createTagMonitor(context) {
	/** @type {import('../../types.js').PElement} */
	let element;
	return {
		actions: {
			addElementName: h.action({
				run({ value }) {
					element.name += value;
					element.end = context.index + 1;
				},
			}),
			initializeElement: h.action({
				run() {
					element = context.stack.peek({ expect: ['Element'] });
				},
			}),
		},
		states: {
			attribute: createAttributeMonitor(context),
			end: createEndMonitor(context),
			name: createNameMonitor(),
			open: createOpenMonitor(context),
			selfClose: createSelfCloseMonitor(context),
		},
	};
}
