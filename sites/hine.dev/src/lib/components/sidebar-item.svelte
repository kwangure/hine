<script>
	import { Outline } from '$lib/components/index.js';
	import { page } from '$app/stores';
	import { Sidebar } from '@hinejs/svelte-ui/components';

	/** @type {string} */
	export let href;
	/** @type {import('@hinejs/vite-plugin-markdown').TocEntry[]}*/
	export let toc = [];
</script>

<li class="flex flex-col gap-1">
	<Sidebar.Link {href}><slot /></Sidebar.Link>
	{#if $page.url.pathname === href}
		<Outline {toc} />
	{/if}
</li>
