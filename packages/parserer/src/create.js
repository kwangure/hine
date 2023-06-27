import {
	createMustacheMonitor,
	createMustacheState,
} from './states/mustache/mustache.js';
import { createStartMonitor, createStartState } from './states/start.js';
import { createTagMonitor, createTagState } from './states/tag/tag.js';
import { createTextMonitor, createTextState } from './states/text.js';
import { createEOFState } from './states/eof.js';
import { createFragmentState } from './states/fragment.js';
import { h } from 'hine';
import { PFragment } from './nodes.js';
import { PStack } from './stack.js';

const ALPHA_CHARACTER_RE = /[A-z]/;

export function createParser() {
	/** @type {import('$types').ParserContext} */
	const context = {
		index: 0,
		html: new PFragment(),
		nestingLevel: 0,
		stack: new PStack(),
	};

	const parser = h.compound({
		name: 'parser',
		conditions: {
			isAlphaCharacter: h.condition(({ value }) =>
				ALPHA_CHARACTER_RE.test(value),
			),
			isForwardSlash: h.condition(({ value }) => value === '/'),
			isMustacheClose: h.condition(({ value }) => value === '}'),
			isMustacheOpen: h.condition(({ value }) => value === '{'),
			isTagClose: h.condition(({ value }) => value === '>'),
			isTagOpen: h.condition(({ value }) => value === '<'),
			isWhiteSpace: h.condition(({ value }) => value === ' '),
		},
		on: {
			CHARACTER: [
				{
					actions: ['increment'],
				},
			],
		},
		states: {
			start: createStartState(),
			eof: createEOFState(),
			fragment: createFragmentState(),
			mustache: createMustacheState(context),
			tag: createTagState(context),
			text: createTextState(),
		},
	});

	parser.monitor({
		actions: {
			increment: h.action(() => (context.index += 1)),
		},
		states: {
			mustache: createMustacheMonitor(context),
			start: createStartMonitor(context),
			tag: createTagMonitor(context),
			text: createTextMonitor(context),
		},
	});

	parser.start();

	return /** @type {import('./types').WritableParserWithContext} */ (
		Object.assign(parser, { context })
	);
}
