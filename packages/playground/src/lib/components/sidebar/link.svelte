<script>
	import { page } from '$app/stores';

	/** @type {string} */
	export let href;

	$: active = href === $page.url.pathname;
	$: ariaCurrent = active ? /** @type {const} */ ('page') : null;
</script>

{#if active}
	<a
		{href}
		class="flex h-8 cursor-pointer items-center gap-2 whitespace-nowrap rounded bg-blue-200 px-4 py-1 text-blue-500
		hover:bg-blue-300 hover:text-blue-700 dark:bg-neutral-700 dark:text-inherit dark:hover:bg-neutral-500 dark:hover:text-inherit"
		aria-current={ariaCurrent}
	>
		<slot />
	</a>
{:else}
	<a
		{href}
		class="flex h-8 cursor-pointer items-center gap-2 whitespace-nowrap rounded px-4 py-1 hover:bg-blue-200 hover:text-blue-600 dark:hover:bg-neutral-700 dark:hover:text-inherit"
		aria-current={ariaCurrent}
	>
		<slot />
	</a>
{/if}
