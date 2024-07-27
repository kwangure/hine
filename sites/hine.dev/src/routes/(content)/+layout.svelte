<script>
	import logo from '@hine/assets/logo.svg';
	import logodark from '@hine/assets/logo-dark.svg';
	import Navbar from '$lib/navbar/navbar.svelte';
	import { Shell } from '@svelte-thing/components';
</script>

<svelte:head>
	<!-- TODO: respect .dark :root class instead of system settings -->
	<link rel="icon" href={logo} media="(prefers-color-scheme: light)" />
	<link rel="icon" href={logodark} media="(prefers-color-scheme: dark)" />
</svelte:head>

<Shell.Root>
	<Navbar />
	<slot />
</Shell.Root>
