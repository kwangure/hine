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
