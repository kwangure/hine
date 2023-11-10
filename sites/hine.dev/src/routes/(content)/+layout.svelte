<script>
	import { Icon, Shell } from '@svelte-thing/components';
	import { mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js';
	import { siGithub, siNpm } from 'simple-icons';
	import { createDarkModeButton } from '@svelte-thing/components/creators';
	import logo from '@hine/assets/logo.svg';
	import logodark from '@hine/assets/logo-dark.svg';
	import { wordmark } from '@hine/assets';

	const darkMode = createDarkModeButton();
	const { button } = darkMode.elements;
	const { mode } = darkMode.state;

	let darkModeIcon = '';
	let darkModeLabel = '';
	$: {
		if ($mode === 'dark') {
			darkModeIcon = mdiWhiteBalanceSunny;
			darkModeLabel =  'Switch to light mode';
		} else if ($mode === 'light') {
			darkModeIcon = mdiWeatherNight;
			darkModeLabel  = 'Switch to dark mode';
		}
	}
</script>

<svelte:head>
	<!-- TODO: respect .dark :root class instead of system settings -->
	<link rel="icon" href={logo} media="(prefers-color-scheme: light)"/>
	<link rel="icon" href={logodark} media="(prefers-color-scheme: dark)"/>
</svelte:head>

<Shell.Root>
	<Shell.Navbar>
		<a href="/" class="text-xl uppercase lg:px-6">
			<svg viewBox={wordmark.viewBox} height="20px">
				<path d={wordmark.path} fill="currentColor"/>
			</svg>
		</a>
		<div class="ml-auto flex gap-1 lg:pr-6">
			<Icon.Link href="https://github.com/kwangure/hine" label="GitHub" path={siGithub.path}/>
			<Icon.Link href="https://www.npmjs.com/package/hine" label="NPM" path={siNpm.path}/>
			<Icon.Button action={button} label={darkModeLabel} path={darkModeIcon}/>
		</div>
	</Shell.Navbar>
	<slot />
</Shell.Root>
