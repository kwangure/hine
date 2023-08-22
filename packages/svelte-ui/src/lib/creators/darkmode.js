import { get, writable } from 'svelte/store';

/**
 * @template {any} T
 * @param {string} key
 * @param {T} fallback
 * @returns {T}
 */
function getLocalStorageItem(key, fallback) {
	try {
		const item = localStorage.getItem(key);
		if (!item) return fallback;
		return JSON.parse(item);
	} catch (error) {
		return fallback;
	}
}

/**
 * @param {string} key
 * @param {any} value
 */
function setLocalStorageItem(key, value) {
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch (error) {
		if (
			/** @type {any} */ (error).message.includes('localStorage is not defined')
		)
			return;
		throw error;
	}
}

/**
 * @param {'light' | 'dark'} to
 */
function toggleDarkClass(to) {
	try {
		const op = to === 'dark' ? 'add' : 'remove';
		document.documentElement.classList[op]('dark');
	} catch (error) {
		if (/** @type {any} */ (error).message.includes('document is not defined'))
			return;
		throw error;
	}
}

const THEME_LOCAL_STORAGE_KEY = 'theme';

export function createDarkModeButton() {
	const defaultTheme = /** @type {'light' | 'dark'} */ ('dark');
	const store = writable(defaultTheme, (set) => {
		const theme = getLocalStorageItem(THEME_LOCAL_STORAGE_KEY, defaultTheme);
		set(theme);
		toggleDarkClass(theme);
	});
	const { set, subscribe } = store;

	function handleClick() {
		const currentMode = get(store);
		const newMode = currentMode === 'dark' ? 'light' : 'dark';
		set(newMode);
		setLocalStorageItem(THEME_LOCAL_STORAGE_KEY, newMode);
		toggleDarkClass(newMode);
	}

	/**
	 * @param {HTMLElement} node
	 */
	function button(node) {
		node.addEventListener('click', handleClick);

		return {
			destroy() {
				node.removeEventListener('click', handleClick);
			},
		};
	}

	return {
		elements: { button },
		state: { mode: { subscribe } },
	};
}
