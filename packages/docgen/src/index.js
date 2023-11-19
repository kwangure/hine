import * as tsEstree from '@typescript-eslint/typescript-estree';
import { TSDocParser, ParserContext } from '@microsoft/tsdoc';
import fs from 'node:fs';
import path from 'node:path';

const CWD = process.cwd();
const packageJsonPath = path.join(CWD, 'package.json');

const tsFiles = getPackageJsonDeclarationFiles(packageJsonPath);
printExportedTypes(tsFiles);

/**
 * Reads the package.json file and gathers TypeScript files from exports.
 * @param {string} filePath - The path to the package.json file.
 * @returns {string[]} An array of TypeScript file paths.
 */
function getPackageJsonDeclarationFiles(filePath) {
	/** @type {string[]} */
	const tsFiles = [];
	try {
		const fileContent = fs.readFileSync(filePath, { encoding: 'utf8' });
		const packageJson = JSON.parse(fileContent);

		if (packageJson.exports) {
			gatherDeclarationFiles(packageJson.exports, tsFiles);
		}
	} catch (error) {
		console.error('Error reading package.json:', error);
	}
	return tsFiles;
}

/**
 * Recursively walks through the exports object of a package.json file and gathers TypeScript files.
 * @param {Object} exportsObj - The exports object from package.json.
 * @param {string[]} tsFiles - Array to store `.d.ts` file paths.
 */
function gatherDeclarationFiles(exportsObj, tsFiles) {
	for (const value of Object.values(exportsObj)) {
		if (typeof value === 'object' && value !== null) {
			// Recurse for nested objects
			gatherDeclarationFiles(value, tsFiles);
		} else if (typeof value === 'string' && value.endsWith('.d.ts')) {
			// Collect TypeScript file paths
			tsFiles.push(path.join(CWD, value));
		}
	}
}

/**
 * Prints exported types from TypeScript files.
 * @param {string[]} tsFiles - Array of TypeScript file paths.
 */
function printExportedTypes(tsFiles) {
	for (const filePath of tsFiles) {
		try {
			console.log({ filePath });
			const fileContent = fs.readFileSync(filePath, 'utf8');
			const ast = parse(fileContent);

			const exportFileName = path.basename(filePath, '.d.ts') + '_export.json';
			const exportFilePath = path.join(CWD, 'exports', exportFileName);

			/** @type {any[]} */
			const jsDocs = [];

			walk(
				ast,
				(node) => {
					if (!node.source?.value) {
						throw Error(
							"Nodes with no source not supported. Use `export { value } from './module.js'` syntax.",
						);
					}
					const parsedPath = path.parse(filePath);
					const sourceFilePath = path.join(
						parsedPath.dir,
						`${trimExtension(node.source.value)}.d.ts`,
					);
					const sourceFileContent = fs.readFileSync(sourceFilePath, 'utf8');
					const sourceAST = parse(sourceFileContent);
					const exportedTypeName = node.specifiers[0].exported.name;

					// Find the type definition and extract JSDoc
					const jsDoc = findAndExtractJSDoc(sourceAST, exportedTypeName);
					jsDocs.push(jsDoc);
				},
				isExportNode,
			);

			// Write the extracted JSDoc to the specified file
			fs.writeFileSync(exportFilePath, JSON.stringify(jsDocs, null, 4), 'utf8');
		} catch (error) {
			console.error(`Error processing file ${filePath}:`, error);
		}
	}
}

/**
 * @param {string} code
 */
function parse(code) {
	const ast = tsEstree.parse(code, {
		loc: true,
		sourceType: 'module',
		comment: true,
	});
	attachComments(ast);
	return ast;
}

/**
 * Walks the AST and finds filtered nodes.
 * @template {import('@typescript-eslint/typescript-estree').TSESTree.Node} T
 * @param {import('@typescript-eslint/typescript-estree').TSESTree.Node} node - The AST node to process.
 * @param {(node: T) => void} callback - Callback to handle the filtered node.
 * @param {((node: import('@typescript-eslint/typescript-estree').TSESTree.Node) => node is T)} [filter]
 */
export function walk(
	node,
	callback,
	filter = /** @type {(_node: any) => _node is T} */ ((_node) => true),
) {
	if (!node || typeof node !== 'object') {
		return;
	}

	if (filter(node)) {
		callback(node);
	}

	for (const value of Object.values(node)) {
		if (Array.isArray(value)) {
			for (const item of value) {
				if (item && typeof item === 'object' && 'type' in item) {
					walk(item, callback, filter);
				}
			}
		} else if (value && typeof value === 'object' && 'type' in value) {
			walk(value, callback, filter);
		}
	}
}

/**
 * Inserts comments into the AST nodes.
 * @param {tsEstree.TSESTree.Program} ast - The AST to which comments should be added.
 */
export function attachComments(ast) {
	if (!ast.comments) {
		return;
	}

	// Sort comments by their start location
	const sortedComments = [...ast.comments].sort(
		(a, b) =>
			a.loc.start.line - b.loc.start.line ||
			a.loc.start.column - b.loc.start.column,
	);

	let currentCommentIndex = 0;

	walk(ast, (node) => {
		if (node.type === 'Program') return;

		let nodeComments = [];

		while (currentCommentIndex < sortedComments.length) {
			const comment = sortedComments[currentCommentIndex];

			if (
				comment.loc.end.line < node.loc.start.line ||
				(comment.loc.end.line === node.loc.start.line &&
					comment.loc.end.column < node.loc.start.column)
			) {
				nodeComments.push(comment);
				currentCommentIndex++;
			} else {
				break;
			}
		}

		if (nodeComments.length > 0) {
			node.leadingComments = (node.leadingComments || []).concat(nodeComments);
		}
	});
}

/**
 * @param {tsEstree.TSESTree.Node} node
 * @returns {node is tsEstree.TSESTree.ExportNamedDeclaration}
 */
function isExportNode(node) {
	return node.type === 'ExportNamedDeclaration';
}

/**
 * Returns the file path without its extension.
 * @param {string} filepath - The full file path with extension.
 * @returns {string} The file path without the extension.
 */
function trimExtension(filepath) {
	const lastIndexOfDot = filepath.lastIndexOf('.');
	if (lastIndexOfDot === -1) return filepath;
	return filepath.substring(0, lastIndexOfDot);
}

/**
 * Finds and extracts JSDoc comments for a given exported type name from an AST.
 * @param {tsEstree.TSESTree.Node} ast - The AST of a TypeScript file.
 * @param {string} exportedName - The name of the exported type.
 * @returns {string | null} The extracted JSDoc comment, or null if not found.
 */
function findAndExtractJSDoc(ast, exportedName) {
	fs.writeFileSync(
		'ast.json',
		JSON.stringify({ name: exportedName, ast }, null, 4),
	);
	const exported = { name: exportedName, type: '' };
	walk(
		ast,
		(node) => {
			const { declaration, leadingComments } = node;
			if (!declaration || !leadingComments?.length) return;
			if (declaration.type === 'TSDeclareFunction') {
				/**
				 * @example
				 * export function foo(do: string): number;
				 */
				if (declaration.id?.name !== exportedName) return;
				exported.type = node.declaration.type;
				/** @type {(node: tsEstree.TSESTree.Comment) => node is tsEstree.TSESTree.BlockComment} */
				const isBlockComment = (node) => node.type === 'Block';
				const maybeComment = leadingComments.findLast(isBlockComment);
				if (!maybeComment) return;

				const jsDocComment = `/*${maybeComment}*/`;
				const tsdocParser = new TSDocParser();
				const parserContext = tsdocParser.parseString(jsDocComment);
				if (parserContext.log.messages.length > 0) {
					throw new Error(
						'Syntax error: ' + parserContext.log.messages[0].text,
					);
				}
				parserContext
			}
		},
		isExportNode,
	);
	return '';
}
