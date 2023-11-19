import fs from 'node:fs';
import path from 'node:path';

/**
 * Deletes all files and subdirectories in a given directory, except for specified exceptions.
 * @param {string} dirPath - The path to the directory to be cleared.
 * @param {string[]} exceptions - Array of relative paths to exclude from deletion.
 */
export function clearDirectoryExcept(dirPath, exceptions) {
	if (!fs.existsSync(dirPath)) {
		throw new Error(`Directory does not exist: ${dirPath}`);
	}

	for (const dirent of fs.readdirSync(dirPath, { withFileTypes: true })) {
		const filePath = path.join(dirPath, dirent.name);

		// Check if the current path or any of its descendants are in the exceptions
		const isException = exceptions.some(
			(exception) =>
				exception === filePath || exception.startsWith(filePath + path.sep),
		);

		// Skip if the file or any of its descendants are in the exceptions list
		if (isException) {
			continue;
		}

		if (dirent.isDirectory()) {
			// Recursively clear the subdirectory
			clearDirectoryExcept(filePath, exceptions);
			// Check again if the directory can now be deleted
			if (!fs.readdirSync(filePath).length) {
				fs.rmdirSync(filePath);
			}
		} else {
			// Delete the file
			fs.unlinkSync(filePath);
		}
	}
}
