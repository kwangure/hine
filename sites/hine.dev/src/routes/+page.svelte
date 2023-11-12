<script>
	import Navbar from '$lib/navbar.svelte';
	import { Shell } from '@svelte-thing/components';
	import { wordmark } from '@hine/assets';
</script>

<svelte:head>
	<title>Hine - A state machine library</title>
</svelte:head>

<Shell.Root --st-content-width={"var(--landing-st-content-width)"}>
	<Navbar/>
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