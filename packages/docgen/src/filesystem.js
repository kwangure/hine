import fs from 'node:fs';

/**
 * @param {string} dir
 */
export function mkdirp(dir) {
	try {
		fs.mkdirSync(dir, { recursive: true });
	} catch (error) {
		if (/** @type {any} */ (error).code === 'EEXIST') {
			if (!fs.statSync(dir).isDirectory()) {
				throw new Error(
					`Cannot create directory ${dir}, a file already exists at this position`,
				);
			}
			return;
		}
		throw error;
	}
}

/**
 * @param {string} path
 */
export function rimraf(path) {
	fs.rmSync(path, { recursive: true, force: true });
}

/**
 * Finds the nearest common ancestor of a list of file paths.
 *
 * @param {string[]} filePaths - An array of file paths.
 * @returns {string} The nearest common ancestor path.
 */
export function getCommonAncestor(filePaths) {
	if (filePaths.length === 0) {
		return '';
	}

	let minLength = filePaths[0].length;
	// Find the length of the shortest path
	for (const path of filePaths) {
		if (path.length < minLength) {
			minLength = path.length;
		}
	}

	let commonPath = '';
	for (let i = 0; i < minLength; i++) {
		let currentChar = filePaths[0][i];

		// Check if this character is the same in all paths
		for (const path of filePaths) {
			if (path[i] !== currentChar) {
				// Return up to the last '/' encountered for a valid directory path
				let lastSlashIndex = commonPath.lastIndexOf('/');
				return commonPath.substring(0, lastSlashIndex);
			}
		}

		commonPath += currentChar;
	}

	// Handle the case where all paths are the same up to the length of the shortest path
	let lastSlashIndex = commonPath.lastIndexOf('/');
	return commonPath.substring(0, lastSlashIndex);
}
