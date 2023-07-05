import { simple } from './ast.js';

/**
 * @param {import("parserer").PElementJSON } node
 * @param {Record<string, any>} onElements
 */
function OnElement(node, onElements) {
	if (node.name === 'on') {
		simple(node, { Element: EventElement }, onElements);
	}
}

/**
 * @param {import("parserer").PElementJSON } node
 * @param {Record<string, any>} onElements
 */
function EventElement(node, onElements) {
	if (node.name === 'event') {
		const handler = /** @type {{ name: string; actions: any[] }} */ ({});
		simple(node, { Attribute: ActionOrNameAttribute }, handler);
		let handlers = onElements[handler.name];
		if (!handlers) {
			handlers = [];
			onElements[handler.name] = handlers;
		}
		handlers.push({ actions: handler.actions });
	}
}

/**
 * @param {import('parserer').PAttributeJSON} node
 * @param {Record<string, any>} eventElement
 */
function ActionOrNameAttribute(node, eventElement) {
	if (typeof node.value === 'boolean') return;
	if (node.name === 'name') {
		eventElement.name = node.value[0].raw;
	}
	if (node.name === 'action') {
		if (!Array.isArray(eventElement.actions)) {
			eventElement.actions = [];
		}
		eventElement.actions.push(node.value[0].raw);
	}
}

/**
 * @param {import('parserer').PFragmentJSON} ast
 */
export function compilePattern(ast) {
	const onNode = {};
	simple(ast, { Element: OnElement }, onNode);
	return { on: onNode };
}
