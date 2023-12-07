import * as tsmorph from 'ts-morph';
import { createLogger } from 'vite';
import { cwd } from 'node:process';
import fs from 'node:fs';
import path from 'node:path';

/**
 * A Vite plugin that checks all exported APIs and types in Hine
 * have reference documentation, and that all reference documentation
 * still exists in the exported package.
 *
 * @returns {import('vite').Plugin}
 */
export function reference() {
	const logger = createLogger();

	return {
		name: 'vite-plugin-reference',
		buildStart() {
			validateHineReferenceDocs(logger);
		},
		buildEnd() {
			validateHineReferenceDocs(logger);
		},
	};
}

/**
 * @param {import("vite").Logger} logger
 */
function validateHineReferenceDocs(logger) {
	const hinePath = path.join(cwd(), 'node_modules/hine');
	const declarationFiles = getPackageJsonDeclarationFiles(hinePath);
	const project = initializeTsProject(declarationFiles);

	/** @type {Set<string>} */
	const exports = new Set();
	for (const file of declarationFiles) {
		const sourcefile = project.getSourceFile(file);
		if (!sourcefile) {
			throw Error(`Unable to find file '${file}' in Hine's package.json`);
		}
		for (const key of sourcefile.getExportedDeclarations().keys()) {
			exports.add(key.toLowerCase());
		}
	}

	const hineReferenceDir = path.join(cwd(), 'src/thing/collections/reference');
	for (const exportedDeclaration of exports) {
		const exportReferenceDir = path.join(
			hineReferenceDir,
			exportedDeclaration,
			'readme.md',
		);
		if (!fs.existsSync(exportReferenceDir)) {
			logger.error(
				`Expected reference documentation for '${exportedDeclaration}' at '${exportReferenceDir}'`,
				{ timestamp: true },
			);
		}
	}

	for (const entry of fs.readdirSync(hineReferenceDir, {
		withFileTypes: true,
	})) {
		if (entry.isDirectory()) {
			if (!exports.has(entry.name)) {
				logger.error(
					`API Reference "${entry.name}" is documented but not exported by Hine.`,
					{ timestamp: true },
				);
			}
		}
	}
}

/**
 * Reads the package.json file and gathers TypeScript declaration files from exports.
 * @param {string} cwd - The directory the command should start from
 * @returns {string[]} - An array of TypeScript declaration file paths.
 */
export function getPackageJsonDeclarationFiles(cwd) {
	const packageJsonPath = path.join(cwd, 'package.json');
	/** @type {string[]} */
	const tsFiles = [];
	try {
		const fileContent = fs.readFileSync(packageJsonPath, 'utf8');
		const packageJson = JSON.parse(fileContent);

		if (packageJson.exports) {
			gatherDeclarationFiles(packageJson.exports, cwd, tsFiles);
		}
	} catch (error) {
		console.error('Error reading package.json:', error);
	}
	return tsFiles;
}

/**
 * Gathers TypeScript `.d.ts` files from the exports object of package.json file.
 * @param {Object} exportsObj - The exports object from package.json.
 * @param {string} cwd - The directory the command should start from
 * @param {string[]} tsFiles - Array to store `.d.ts` file paths.
 */
export function gatherDeclarationFiles(exportsObj, cwd, tsFiles) {
	for (const value of Object.values(exportsObj)) {
		if (typeof value === 'object' && value !== null) {
			gatherDeclarationFiles(value, cwd, tsFiles);
		} else if (
			typeof value === 'string' &&
			!value.startsWith('./docs') &&
			value.endsWith('.d.ts')
		) {
			tsFiles.push(path.join(cwd, value));
		}
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
