import * as tsmorph from 'ts-morph';
import { getNodeDocs, initializeTsProject, TSNodeError } from './tsmorph.js';
import { mkdirp, rimraf } from './filesystem.js';
import { getPackageJsonDeclarationFiles } from './collect.js';
import path from 'node:path';

main();

function main() {
	const packageExports = getPackageJsonDeclarationFiles();
	writeDocumentation(packageExports);
}

/**
 * Generates documentation for the entry TypeScript files in the Project.
 * @param {string[]} packageEntryFiles - Array of entry file paths.
 */
async function writeDocumentation(packageEntryFiles) {
	const packageProject = initializeTsProject(packageEntryFiles);
	const docsProject = initializeTsProject([], {
		compilerOptions: {
			outDir: 'docs',
			declaration: true,
			sourceMap: true,
			target: tsmorph.ScriptTarget.ES2022,
		},
	});

	const docsProjectDir = path.join(process.cwd(), 'node_modules/.ts-docs');
	rimraf(docsProjectDir);
	mkdirp(docsProjectDir);

	const seenSourceFiles = new Set();
	for (const packageEntryFilePath of packageEntryFiles) {
		const packageSourceFile =
			packageProject.getSourceFile(packageEntryFilePath);
		if (!packageSourceFile) {
			throw Error(
				`File '${packageEntryFilePath}' from package.json not found.`,
			);
		}
		const exportedDeclarations = packageSourceFile.getExportedDeclarations();
		for (const declarations of exportedDeclarations.values()) {
			for (const declaration of declarations) {
				writeNodeDocumentation(docsProject, declaration, docsProjectDir);
			}
		}

		copyExports(packageSourceFile);
	}
	await docsProject.save();
	await docsProject.emit();

	/**
	 * @param {tsmorph.SourceFile} packageSourceFile
	 */
	function copyExports(packageSourceFile) {
		const packageSourceFilepath = packageSourceFile.getFilePath();
		if (seenSourceFiles.has(packageSourceFilepath)) {
			return;
		} else {
			seenSourceFiles.add(packageSourceFilepath);
		}
		const sourceBasePath = packageSourceFilepath
			.slice(process.cwd().length + 1)
			.replace('.d.ts', '.ts');
		const docsFilePath = path.join(docsProjectDir, sourceBasePath);
		let docsSourceFile = docsProject.getSourceFile(docsFilePath);
		if (!docsSourceFile) {
			docsSourceFile = docsProject.createSourceFile(docsFilePath, '');
		}
		const exportDeclarations = packageSourceFile.getExportDeclarations();
		docsSourceFile.addExportDeclarations(
			exportDeclarations.map((d) => d.getStructure()),
		);

		for (const declaration of exportDeclarations) {
			const specifierSourceFile = declaration.getModuleSpecifierSourceFile();
			if (specifierSourceFile) copyExports(specifierSourceFile);
		}
	}
}

/**
 * @param {tsmorph.Project} docsProject
 * @param {tsmorph.Node} node
 * @param {string} docsProjectDir
 */
function writeNodeDocumentation(docsProject, node, docsProjectDir) {
	const sourceFile = node.getSourceFile();
	const sourceFilePath = sourceFile.getFilePath();
	const sourceBasePath = sourceFilePath
		.slice(process.cwd().length + 1)
		.replace('.d.ts', '.ts');
	const docsFilePath = path.join(docsProjectDir, sourceBasePath);
	let docsSourceFile = docsProject.getSourceFile(docsFilePath);
	if (!docsSourceFile) {
		docsSourceFile = docsProject.createSourceFile(docsFilePath, '');
	}
	if (tsmorph.Node.hasName(node)) {
		const nodeDocs = getNodeDocs(node);
		if (typeof nodeDocs.description == 'string') {
			nodeDocs.description = nodeDocs.description.trim();
		}
		let type;
		switch (node.getKindName()) {
			case 'ClassDeclaration':
				type = 'ClassDoc';
				break;
			case 'FunctionDeclaration':
				type = 'FunctionDoc';
				break;
			case 'TypeAliasDeclaration':
				type = 'TypeDoc';
				break;
			default:
				throw new TSNodeError({
					node,
					message: 'Doc type for node not implemented.',
				});
		}
		docsSourceFile.addImportDeclaration({
			isTypeOnly: true,
			moduleSpecifier: '@hine/docgen',
			namedImports: [{ name: type }],
		});
		docsSourceFile.addVariableStatement({
			declarationKind: tsmorph.VariableDeclarationKind.Const,
			isExported: true,
			declarations: [
				{
					name: node.getName() ?? '',
					type,
					initializer: [
						'{',
						`	type: '${node.getKindName()}',`,
						`	docs: {`,
						`		description: ${JSON.stringify(nodeDocs.description)},`,
						`	},`,
						'}',
					].join('\n'),
				},
			],
		});
	} else {
		throw new TSNodeError({
			message:
				'Generating docs for a node without a name is not supported. File an issue.',
			node: node,
		});
	}
}
