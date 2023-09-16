import sharedConfig from 'prettier-config';

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
