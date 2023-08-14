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
 * @param {string} root
 * @param {string} current
 * @param {((filepath: string, entry: fs.Dirent) => void)} visitor
 */
function walkDir(root, current, visitor) {
	const dirs = fs.readdirSync(path.resolve(root, current), {
		// 2X faster than `fs.readdirSync` followed by `fs.statSync`
		withFileTypes: true,
	});
	for (const entry of dirs) {
		const child = path.posix.join(current, entry.name);
		const isDirectory = entry.isDirectory();
		visitor(isDirectory ? `${child}/` : child, entry);
		if (isDirectory) walkDir(root, child, visitor);
	}
}

/**
 * @param {string} dir
 * @param {(filepath: string, entry: fs.Dirent) => void} visitor
 */
export function walk(dir, visitor) {
	if (fs.existsSync(dir)) walkDir(dir, '', visitor);
}

/**
 * @param {string} file
 * @param {string} contents
 */
export function write(file, contents) {
	mkdirp(path.dirname(file));
	fs.writeFileSync(file, contents);
}
