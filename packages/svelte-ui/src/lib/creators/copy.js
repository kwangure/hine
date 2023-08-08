import { writable } from 'svelte/store';

export function createTextCopier() {
	const isCopied = writable(false);
	let copyTimeout = 0;

	/**
	 * @param {string} string
	 */
	function copy(string) {
		if (typeof navigator === 'undefined') return;
		navigator.clipboard.writeText(string);
		isCopied.set(true);
		clearTimeout(copyTimeout);
		copyTimeout = window.setTimeout(() => {
			isCopied.set(false);
		}, 2000);
	}

	return { isCopied, copy };
}
