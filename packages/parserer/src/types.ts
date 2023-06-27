import type {
	PBlockStatement,
	PAttribute,
	PBlock,
	PElement,
	PFragment,
	PMustache,
	PShorthand,
	PText,
} from './nodes.js';
import type { CompoundState } from 'hine';
import type { PStack } from './stack.js';
import type { Writable } from 'svelte/store';

export type { PBlockStatement, PElement, PMustache };

export interface ParserContext {
	index: number;
	html: PFragment;
	nestingLevel: number;
	stack: PStack;
}

export type ParserWithContext = CompoundState & { context: ParserContext };

export type WritableParserWithContext = ParserWithContext &
	Writable<ParserWithContext>;

export interface PFragmentConfig {
	start: number;
	end?: number;
}

export interface PTextConfig {
	start: number;
	end?: number;
}

export interface PAttributeJSON {
	type: 'Attribute';
	start: number;
	end: number;
	name: string;
	value:
		| true
		| ReturnType<
				PMustache['toJSON'] | PShorthand['toJSON'] | PText['toJSON']
		  >[];
}

export interface PElementJSON {
	type: 'Element';
	start: number;
	end: number;
	name: string;
	attributes: ReturnType<PAttribute['toJSON']>[];
	children: ReturnType<PTemplateNode['toJSON']>[];
}

export interface PBlockJSON {
	type: 'Block';
	start: number;
	end: number;
	children: ReturnType<PBlockStatement['toJSON']>[];
}

export type PBlockStatementChild = PBlock | PElement | PMustache | PText;

export interface PBlockStatementJSON {
	type: 'BlockStatement';
	start: number;
	end: number;
	name: string;
	raw: string;
	children: ReturnType<PBlockStatementChild['toJSON']>[];
}

export interface PFragmentJSON {
	type: 'Fragment';
	start: number;
	end: number;
	children: ReturnType<PTemplateNode['toJSON']>[];
}

export type PTemplateNode =
	| PAttribute
	| PBlock
	| PBlockStatement
	| PElement
	| PFragment
	| PMustache
	| PShorthand
	| PText;

export {};
