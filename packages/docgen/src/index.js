import * as tsmorph from 'ts-morph';
import fs from 'node:fs';
import path from 'node:path';

// Main execution
const entryFiles = getPackageJsonDeclarationFiles();
const project = initializeTsProject(entryFiles);
generateDocumentation(project, entryFiles);

/**
 * Initializes the TypeScript project and adds source files defined in package.json exports.
 * @param {string[]} entryFiles
 * @returns {tsmorph.Project} The TypeScript project.
 */
function initializeTsProject(entryFiles) {
	const project = new tsmorph.Project();
	project.addSourceFilesAtPaths(entryFiles);
	project.resolveSourceFileDependencies();
	return project;
}

/**
 * Reads the package.json file and gathers TypeScript declaration files from exports.
 * @returns {string[]} An array of TypeScript declaration file paths.
 */
function getPackageJsonDeclarationFiles() {
	const cwd = process.cwd();
	const packageJsonPath = path.join(cwd, 'package.json');
	/** @type {string[]} */
	const tsFiles = [];
	try {
		const fileContent = fs.readFileSync(packageJsonPath, 'utf8');
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
 * Gathers TypeScript `.d.ts` files from the exports object of package.json file.
 * @param {Object} exportsObj - The exports object from package.json.
 * @param {string[]} tsFiles - Array to store `.d.ts` file paths.
 */
function gatherDeclarationFiles(exportsObj, tsFiles) {
	for (const value of Object.values(exportsObj)) {
		if (typeof value === 'object' && value !== null) {
			gatherDeclarationFiles(value, tsFiles);
		} else if (typeof value === 'string' && value.endsWith('.d.ts')) {
			tsFiles.push(path.join(process.cwd(), value));
		}
	}
}

/**
 * Generates documentation for the entry TypeScript files in the Project.
 * @param {tsmorph.Project} project - The TypeScript project.
 * @param {string[]} entryFiles - Array of entry file paths.
 */
function generateDocumentation(project, entryFiles) {
	const exportsDir = path.join(process.cwd(), 'docs');
	if (!fs.existsSync(exportsDir)) {
		fs.mkdirSync(exportsDir, { recursive: true });
	}

	for (const filePath of entryFiles) {
		const sourceFile = project.getSourceFile(filePath);
		if (!sourceFile) {
			console.error(`Source file not found: ${filePath}`);
			continue;
		}
		const exportedDeclarations = sourceFile.getExportedDeclarations();
		const outputFilePath = path.join(
			exportsDir,
			path.basename(filePath) + '.json',
		);

		/** @type {Record<string, any>} */
		const exportedDeclarationsObject = {};
		for (const [key, declarations] of exportedDeclarations) {
			exportedDeclarationsObject[key] = declarations.map((declaration) => {
				/** @type {tsmorph.JSDoc[]} */
				const foundComments = [];

				walkAstAndFindComments(declaration, foundComments);

				const docs = foundComments.map((comment) => comment.getStructure());

				return docs;
			});
		}

		fs.writeFileSync(
			outputFilePath,
			JSON.stringify(exportedDeclarationsObject, null, 4),
		);
		console.log(`Documentation written to ${outputFilePath}`);
	}
}

/**
 * @param {tsmorph.Node} node
 * @param {tsmorph.JSDoc[]} foundComments
 */
function walkAstAndFindComments(node, foundComments) {
	if (tsmorph.Node.isJSDocable(node)) {
		const JsDocs = node.getJsDocs();
		foundComments.push(...JsDocs)
	}

	node.forEachChild((child) => walkAstAndFindComments(child, foundComments));
}
