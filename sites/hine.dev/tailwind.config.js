/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,svelte}', './node_modules/**/*.{html,svelte}'],
	darkMode: 'class',
	theme: {
		boxShadow: {
			sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
			'sm-dark': '0 1px 2px 0 rgb(0 0 0 / 0.15)',

			DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
			dark: '0 1px 3px 0 rgb(0 0 0 / 0.25), 0 1px 2px -1px rgb(0 0 0 / 0.1)',

			md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
			'md-dark':
				'0 4px 6px -1px rgb(0 0 0 / 0.25), 0 2px 4px -2px rgb(0 0 0 / 0.1)',

			lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
			'lg-dark':
				'0 10px 15px -3px rgb(0 0 0 / 0.25), 0 4px 6px -4px rgb(0 0 0 / 0.1)',

			xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.08)',
			'xl-dark':
				'0 20px 25px -5px rgb(0 0 0 / 0.25), 0 8px 10px -6px rgb(0 0 0 / 0.08)',

			'2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
			'2xl-dark': '0 25px 50px -12px rgb(0 0 0 / 0.75)',

			none: '0 0 #0000',
		},
	},
	plugins: [],
};
