import { simple } from './ast.js';

/**
 * @param {import("parserer").PElementJSON } node
 * @param {Record<string, any>} scriptElement
 */
function ScriptElement(node, scriptElement) {
	if (node.name === 'script') {
		const scriptText =
			/** @type {ReturnType<import("parserer").PText['toJSON']>} */ (
				node.children[0]
			).raw;
		scriptElement.content = scriptText;
	}
}

/**
 * @param {import("parserer").PElementJSON } node
 * @param {import('./types.js').MonitorIR} monitorElement
 */
function MonitorElement(node, monitorElement) {
	if (node.name === 'monitor') {
		simple(
			node,
			{
				Attribute: SrcAttribute,
				Element: (/** @type {any} */ ...args) => {
					// @ts-ignore
					ActionElement(...args);
					// @ts-ignore
					EntryElement(...args);
				},
			},
			monitorElement,
		);
	}
}

/**
 * @param {import("parserer").PElementJSON} node
 * @param {import('./types.js').MonitorIR} monitorElement
 */
function ActionElement(node, monitorElement) {
	if (node.name === 'action') {
		const action = { name: '', value: '' };
		simple(node, { Attribute: NameOrValueAttribute }, action);
		monitorElement.actions.push(action);
	}
}

/**
 * @param {import("parserer").PElementJSON} node
 * @param {import('./types.js').MonitorIR} monitorElement
 */
function EntryElement(node, monitorElement) {
	if (node.name === 'entry') {
		simple(node, { Attribute: ActionAttribute }, monitorElement);
	}
}

/**
 * @param {import('parserer').PAttributeJSON} node
 * @param {Record<string, any>} actionElement
 */
function NameOrValueAttribute(node, actionElement) {
	if (typeof node.value === 'boolean') return;
	if (node.name === 'name') {
		actionElement.name = node.value[0].raw;
	}
	if (node.name === 'value') {
		actionElement.value = node.value[0].raw;
	}
}

/**
 * @param {import('parserer').PAttributeJSON} node
 * @param {import('./types.js').MonitorIR} monitorElement
 */
function ActionAttribute(node, monitorElement) {
	if (typeof node.value === 'boolean') return;
	if (node.name === 'action') {
		monitorElement.entry.push({
			name: node.value[0].raw,
		});
	}
}

/**
 * @param {import('parserer').PAttributeJSON} node
 * @param {import('./types.js').MonitorIR} monitorElement
 */
function SrcAttribute(node, monitorElement) {
	if (typeof node.value === 'boolean') return;
	if (node.name === 'src') {
		monitorElement.src = node.value[0].raw;
	}
}

/**
 * @param {import('parserer').PFragmentJSON} ast
 */
export function processMonitor(ast) {
	const monitor = {
		actions: [],
		entry: [],
		src: '',
	};
	simple(ast, { Element: MonitorElement }, monitor);

	const script = { content: '' };
	simple(ast, { Element: ScriptElement }, script);

	return { monitor, script };
}
