import { simple } from './ast.js';

function OnElement(node, onElements) {
	if (node.name === 'on') {
		const events = [];
		simple(node, { Element: EventElement }, events);
		onElements.push({ events });
	}
}

function EventElement(node, eventElements) {
	if (node.name === 'event') {
		const event = { name: '', actions: [] };
		simple(node, { Attribute: ActionOrNameAttribute }, event);
		eventElements.push(event);
	}
}

function ActionOrNameAttribute(node, eventElement) {
	if (node.name === 'name') {
		eventElement.name = node.value.raw;
	}
	if (node.name === 'action') {
		eventElement.actions.push(node.value[0].raw);
	}
}

export function compile(ast) {
	const onNodes = [];
	simple(ast, { Element: OnElement }, onNodes);
	return { on: onNodes };
}
