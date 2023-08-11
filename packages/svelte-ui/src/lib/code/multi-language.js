import { bash, css, javascript, json, svelte } from './language.js';

const SUPPORTED_LANGUAGES = {
	bash,
	css,
	javascript,
	js: javascript,
	json,
	typescript: javascript,
	ts: javascript,
	svelte,
};

/**
 * @param {any} language
 * @returns {language is keyof typeof SUPPORTED_LANGUAGES}
 */
function isSupported(language) {
	return Object.hasOwn(SUPPORTED_LANGUAGES, language);
}

/**
 * @param {any} code
 * @param {string} [language]
 * @param {{ from?: number; to?: number; }} [options]
 */
export function multiHighlight(code, language, options) {
	if (!language) return [{ color: '', segment: code }];
	if (!isSupported(language)) {
		console.warn(
			`Language '${language}' not supported. Expected one of: ${[
				...Object.keys(SUPPORTED_LANGUAGES),
			].join(', ')}`,
		);
		return [{ color: '', segment: code }];
	}

	return SUPPORTED_LANGUAGES[language](code, options);
}
