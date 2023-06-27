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

export function simple(node, visitors, state, override) {
	(function c(node, st, override) {
		const type = override || node.type,
			found = visitors[type];
		if (type in base) {
			base[type](node, st, c);
		} else {
			console.error(`'${type}' not found in base`);
		}
		if (found) found(node, st);
	}(node, state, override));
}

function Parent(node, state, getChildren) {
	for (const child of node.children) {
		getChildren(child, state);
	}
}

function Ignore() {}

export const base = {
	Attribute(node, state, callback) {
		for (const child of node.value) {
			callback(child, state);
		}
	},
	Block: Parent,
	BlockStatement: Parent,
	Element(node, state, callback) {
		for (const child of node.attributes) {
			callback(child, state);
		}
		for (const child of node.children) {
			callback(child, state);
		}
	},
	Fragment: Parent,
	Text: Ignore,
};