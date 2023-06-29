import { simple } from './ast.js';

function OnElement(node, onElements) {
	if (node.name === 'on') {
		simple(node, { Element: EventElement }, onElements);
	}
}

function EventElement(node, onElements) {
	if (node.name === 'event') {
		const handler = {};
		simple(node, { Attribute: ActionOrNameAttribute }, handler);
		let handlers = onElements[handler.name];
		if (!handlers) {
			handlers = [];
			onElements[handler.name] = handlers;
		}
		handlers.push({ actions: handler.actions });
	}
}

function ActionOrNameAttribute(node, eventElement) {
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

export function compile(ast) {
	const onNode = {};
	simple(ast, { Element: OnElement }, onNode);
	return { on: onNode };
}
