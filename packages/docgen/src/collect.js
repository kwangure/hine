import fs from 'node:fs';
import path from 'node:path';

/**
 * Reads the package.json file and gathers TypeScript declaration files from exports.
 * @returns {string[]} An array of TypeScript declaration file paths.
 */
export function getPackageJsonDeclarationFiles() {
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
export function gatherDeclarationFiles(exportsObj, tsFiles) {
	for (const value of Object.values(exportsObj)) {
		if (typeof value === 'object' && value !== null) {
			gatherDeclarationFiles(value, tsFiles);
		} else if (typeof value === 'string' && value.endsWith('.d.ts')) {
			tsFiles.push(path.join(process.cwd(), value));
		}
	}
}
