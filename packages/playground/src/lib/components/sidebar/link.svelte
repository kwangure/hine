<script>
	import { page } from '$app/stores';

	/** @type {string} */
	export let href;

	$: active = href === $page.url.pathname;
	$: ariaCurrent = active ? /** @type {const} */ ('page') : null;
</script>

<a
	{href}
	class="flex h-8 cursor-pointer items-center gap-2 whitespace-nowrap rounded px-4 py-1"
	class:bg-neutral-700={active}
	class:hover:bg-neutral-500={active}
	class:hover:bg-neutral-700={!active}
	aria-current={ariaCurrent}
>
	<slot />
</a>
