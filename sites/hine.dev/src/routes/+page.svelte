<script>
	import { Icon, Shell } from '@svelte-thing/components';
	import { mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js';
	import { siGithub, siNpm } from 'simple-icons';
	import { createDarkModeButton } from '@svelte-thing/components/creators';
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
	<title>Hine - A state machine library</title>
</svelte:head>

<Shell.Root --st-content-width={"var(--landing-st-content-width)"}>
	<Shell.Navbar showOpen={false}>
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
	<Shell.Main>
		<div class="flex flex-col content-center gap-16 my-20">
			<h1 class='sr-only'>Hine</h1>
			<svg viewBox={wordmark.viewBox} height="72px" aria-hidden="true">
				<path d={wordmark.path} fill="currentColor"/>
			</svg>
			<h2 class="text-center text-5xl">
				The library for state machines
			</h2>
			<a href="/docs" class="px-5 py-2 bg-blue-600 rounded text-white text-lg flex-none self-center">
				Documentation
			</a>
		</div>
	</Shell.Main>
	<footer>

	</footer>
</Shell.Root>

<style>
	@media (min-width: 1280px) {
		:root {
			/*
				If we used `--st-content-width` directly in this file, when
				loaded in dev mode it would affect all pages on navigation.
				So we set the value via a CSS variable prop indirectly.
			*/
			--landing-st-content-width: 64rem;
		}
	}
</style>