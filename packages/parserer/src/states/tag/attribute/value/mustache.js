import { h } from 'hine';
import { PMustache } from '../../../../nodes.js';

/**
 * @param {import('$types').ParserContext} context
 */
export function createMustacheState(context) {
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
					actions: ['finalizeMustacheValue', 'finalizeAttribute'],
				},
				{
					actions: ['addChar'],
				},
			],
			RESET: [
				{
					actions: ['resetMustache'],
				},
			],
		},
	});
}

/**
 * @param {import('$types').ParserContext} context
 */
export function createMustacheMonitor(context) {
	/** @type {PMustache} */
	let mustache;
	return {
		actions: {
			addChar: h.action({
				run({ value }) {
					mustache.raw += value;
					mustache.end = context.index + 1;
				},
			}),
			decrementNesting: h.action(() => {
				context.nestingLevel -= 1;
			}),
			incrementNesting: h.action(() => {
				context.nestingLevel += 1;
			}),
			initializeMustacheValue: h.action({
				run() {
					mustache = new PMustache();
					mustache.start = context.index;
					mustache.end = context.index + 1;
					context.nestingLevel = 0;
					context.stack.push(mustache);
				},
			}),
			finalizeMustacheValue: h.action(() => {
				const value = context.stack.pop({ expect: ['Mustache'] });
				const attribute = context.stack.peek({ expect: ['Attribute'] });
				attribute.append(value);
				value.end = context.index + 1;
				attribute.end = context.index + 1;
			}),
			resetMustache: h.action({
				run() {
					mustache.clear();
					// We know it's not undefined in all other places since `initialize`
					// runs first. Set to `undefined` so that GC can cleanup.
					// @ts-expect-error
					mustache = undefined;
				},
			}),
		},
		entry: [
			{
				actions: ['initializeMustacheValue', 'incrementNesting'],
			},
		],
	};
}
