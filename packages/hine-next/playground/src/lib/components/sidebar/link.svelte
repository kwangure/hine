<script>
	import { page } from '$app/stores';

	/** @type {string} */
	export let href;

	$: active = href === $page.url.pathname;
	$: ariaCurrent = active ? /** @type {const} */('page') : null;
</script>

<a {href} class='whitespace-nowrap cursor-pointer flex items-center h-8 py-1 px-4 rounded gap-2'
	class:bg-neutral-700={active} class:hover:bg-neutral-500={active} class:hover:bg-neutral-700={!active} aria-current={ariaCurrent}>
	<slot/>
</a>
