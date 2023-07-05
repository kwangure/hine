/* eslint-disable id-denylist, max-params */
// AST walker module for Mozilla Parser API compatible trees

// A simple walk is one where you simply specify callbacks to be
// called on specific nodes. The last two arguments are optional. A
// simple use would be
//
//     walk.simple(myTree, {
//         Expression: function(node) { ... }
//     });
//
// to do something with all expressions. All Parser API node types
// can be used to identify node types, as well as Expression and
// Statement, which denote categories of nodes.
//
// The base argument can be used to pass a custom (recursive)
// walker, and state can be used to give this walked an initial
// state.

/**
 * @param {Exclude<ReturnType<import('parserer').PTemplateNode['toJSON']>, { type: 'AttributeShorthand' | 'Mustache' }>} node
 * @param {Record<string, any>} visitors
 * @param {any} state
 */
export function simple(node, visitors, state) {
	(function c(node, st) {
		const found = visitors[node.type];
		if (node.type in base) {
			/** @type {any} */ (base[node.type])(node, st, c);
		} else {
			console.error(`'${node.type}' not found in base`);
		}
		if (found) found(node, st);
	})(node, state);
}

/**
 * @param {Extract<ReturnType<import('parserer').PTemplateNode['toJSON']>, { children: any }>} node
 * @param {any} state
 * @param {(arg0: any, arg1: any) => void} getChildren
 */
function Parent(node, state, getChildren) {
	for (const child of node.children) {
		getChildren(child, state);
	}
}

function Ignore() {}

export const base = {
	/**
	 * @param {ReturnType<import('parserer').PAttribute['toJSON']>} node
	 * @param {any} state
	 * @param {(arg0: any, arg1: any) => void} callback
	 */
	Attribute(node, state, callback) {
		if (typeof node.value === 'boolean') return;
		for (const child of node.value) {
			callback(child, state);
		}
	},
	Block: Parent,
	BlockStatement: Parent,
	/**
	 * @param {ReturnType<import('parserer').PElement['toJSON']>} node
	 * @param {any} state
	 * @param {(arg0: any, arg1: any) => void} callback
	 */
	Element(node, state, callback) {
		for (const child of node.attributes) {
			callback(child, state);
		}
		for (const child of node.children) {
			callback(child, state);
		}
	},
	Fragment: Parent,
	Mustache() {
		// TODO
	},
	Text: Ignore,
};
