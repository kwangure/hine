import * as tsmorph from 'ts-morph';

export class TSNodeError extends Error {
	/**
	 * @param {{
	 *     message: string;
	 *     node: tsmorph.Node;
	 * }} options
	 */
	constructor(options) {
		const { message, node } = options;
		const sourceFile = node.getSourceFile();
		const filePath = sourceFile.getFilePath();
		const line = node.getStartLineNumber();
		const column = node.getStartLinePos();
		const kind = node.getKindName();

		super(
			[
				`\n${filePath}(${line},${column}) [@hine/docgen]: `,
				` - Node:  ${kind}`,
				` - Issue: ${message}`,
			].join('\n'),
		);
	}
}

/**
 * Initializes the TypeScript project and adds source files defined in package.json exports.
 * @param {string[]} entryFiles
 * @param {tsmorph.ProjectOptions} [options]
 * @returns {tsmorph.Project} The TypeScript project.
 */
export function initializeTsProject(entryFiles, options) {
	const project = new tsmorph.Project(options);
	project.addSourceFilesAtPaths(entryFiles);
	project.resolveSourceFileDependencies();
	return project;
}


/**
 * @param {tsmorph.Node} node
 */
export function getNodeDocs(node) {
	if (!tsmorph.Node.isJSDocable(node)) {
		throw new TSNodeError({
			message: 'Node is not JSDocable.',
			node,
		});
	}

	const [jsDoc, ...rest] = node.getJsDocs();
	if (!jsDoc) {
		throw new TSNodeError({
			message: 'Node is missing jsDoc.',
			node,
		});
	}
	if (rest.length) {
		throw new TSNodeError({
			message: 'Unimplemented node with multiple jsDoc blocks.',
			node,
		});
	}

	const docs = jsDoc.getStructure();

	return docs;
}