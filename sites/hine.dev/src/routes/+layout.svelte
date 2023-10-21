<script>
	import './layout.css';
	import logo from '@hine/assets/logo.svg';
	import logodark from '@hine/assets/logo-dark.svg';
</script>

<svelte:head>
	<!-- TODO: respect .dark :root class instead of system settings -->
	<link rel="icon" href={logo} media="(prefers-color-scheme: light)"/>
	<link rel="icon" href={logodark} media="(prefers-color-scheme: dark)"/>
</svelte:head>

<slot />
