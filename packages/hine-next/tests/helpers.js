import fs from 'node:fs';

/**
 * @param {fs.PathOrFileDescriptor} file
 */
export function tryToLoadJson(file) {
	try {
		return JSON.parse(fs.readFileSync(file, 'utf-8'));
	} catch (err) {
		// @ts-ignore
		if (err.code !== 'ENOENT') throw err;
		return null;
	}
}

/**
 * @param {fs.PathOrFileDescriptor} file
 */
export function tryToLoadJS(file) {
	try {
		return fs.readFileSync(file, 'utf-8');
	} catch (err) {
		// @ts-ignore
		if (err.code !== 'ENOENT') throw err;
		return '';
	}
}
