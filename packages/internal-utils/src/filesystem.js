import fs from 'node:fs';
import path from 'node:path';

/** @param {string} dir */
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

/** @param {string} path */
export function rimraf(path) {
	(fs.rmSync || fs.rmdirSync)(path, { recursive: true, force: true });
}

/**
 * @param {string} dir
 * @param {(arg: { filepath: string; stat: fs.Stats }) => boolean} [filter]
 */
export function walk(dir, filter) {
	/** @type {string[]} */
	const files = [];

	/** @param {string} current */
	function walkDir(current) {
		for (const file of fs.readdirSync(path.resolve(dir, current))) {
			const child = path.posix.join(current, file);
			const stat = fs.statSync(path.resolve(dir, child));
			if (stat.isDirectory()) {
				if (!filter || filter({ filepath: child, stat })) {
					files.push(`${child}/`); // append a slash to indicate a directory
				}
				walkDir(child);
			} else {
				if (!filter || filter({ filepath: child, stat })) {
					files.push(child);
				}
			}
		}
	}

	if (fs.existsSync(dir)) walkDir('');

	return files;
}

/**
 * @param {string} file
 * @param {string} contents
 */
export function write(file, contents) {
	mkdirp(path.dirname(file));
	fs.writeFileSync(file, contents);
}
