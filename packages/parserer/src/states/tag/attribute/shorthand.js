import { h } from 'hine';
import { PShorthand } from '../../../nodes.js';

/**
 * @param {import('$types').ParserContext} context
 */
export function createShorthandState(context) {
	return h.atomic({
		conditions: {
			isMustacheDone: h.condition(() => context.nestingLevel === 0),
		},
		on: {
			CHARACTER: [
				{
					condition: 'isMustacheOpen',
					actions: ['incrementNesting'],
				},
				{
					condition: 'isMustacheClose',
					actions: ['decrementNesting'],
				},
				{
					transitionTo: 'done',
					condition: 'isMustacheDone',
					actions: ['finalizeShorthandValue', 'finalizeAttribute'],
				},
				{
					actions: ['addChar'],
				},
			],
			RESET: [
				{
					actions: ['resetValue', 'resetAttribute'],
				},
			],
		},
	});
}

/**
 * @param {import('$types').ParserContext} context
 */
export function createShortHandMonitor(context) {
	/** @type {PShorthand} */
	let value;
	return {
		actions: {
			addChar: h.action({
				run({ value: char }) {
					value.raw += char;
					value.end = context.index + 1;
				},
			}),
			decrementNesting: h.action(() => {
				context.nestingLevel -= 1;
			}),
			incrementNesting: h.action(() => {
				context.nestingLevel += 1;
			}),
			initializeShorthandValue: h.action({
				run() {
					value = new PShorthand();
					value.start = context.index;
					value.end = context.index + 1;
					context.nestingLevel = 0;
					context.stack.push(value);
				},
			}),
			finalizeShorthandValue: h.action(() => {
				const value = context.stack.pop({ expect: ['AttributeShorthand'] });
				const attribute = context.stack.peek({ expect: ['Attribute'] });
				attribute.append(value);
				value.end = context.index + 1;
				attribute.name = value.raw;
				attribute.end = context.index + 1;
			}),
			resetValue: h.action({
				run() {
					value.clear();
					// We know it's not undefined in all other places since `initialize`
					// runs first. Set to `undefined` so that GC can cleanup.
					// @ts-expect-error
					value = undefined;
				},
			}),
		},
		entry: [
			{
				actions: [
					'initializeAttribute',
					'initializeShorthandValue',
					'incrementNesting',
				],
			},
		],
	};
}
