import sharedConfig from '@hinejs/prettier';

/** @type {import("prettier").Config} */
const config = {
	...sharedConfig,
	plugins: ['prettier-plugin-svelte', 'prettier-plugin-tailwindcss'],
	overrides: [
		{
			files: '*.svelte',
			options: {
				parser: 'svelte',
			},
		},
	],
};

export default config;
