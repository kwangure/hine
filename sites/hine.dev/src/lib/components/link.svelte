<script>
	import { page } from '$app/stores';

	/** @type {string} */
	export let lang = "en";
	/** @type {string} */
	export let href;

	/** @type {'location' | 'page' | null | undefined} */
	export let ariaCurrent = undefined;

	$: _ariaCurrent = computeAriaCurrent(href, $page.url.pathname, ariaCurrent);

	/**
	 * @param {string} href
	 * @param {string} pathname
	 * @param {'location' | 'page' | null | undefined} userAriaCurrent
	 */
	export function computeAriaCurrent(href, pathname, userAriaCurrent) {
		if (userAriaCurrent !== undefined) return userAriaCurrent;
		if (href[0] !== '/') return null;

		if (href.endsWith('/')) href =  href.slice(0, href.length - 1);
		if (pathname === href) return 'page';
		if (pathname.startsWith(`${href}/`)) return 'location';

		return null;
	}
</script>

{#if _ariaCurrent}
	<a
		{href}
		{lang}
		class="flex h-8 cursor-pointer items-center gap-2 whitespace-nowrap rounded bg-blue-200 px-4 py-1 text-blue-600 hover:bg-blue-300 hover:text-blue-700 dark:bg-neutral-700 dark:text-inherit dark:hover:bg-neutral-500 dark:hover:text-inherit"
		aria-current={_ariaCurrent}
	>
		<slot />
	</a>
{:else}
	<a
		{href}
		{lang}
		class="flex h-8 cursor-pointer items-center gap-2 whitespace-nowrap rounded px-4 py-1 hover:bg-blue-200 hover:text-blue-600 dark:hover:bg-neutral-700 dark:hover:text-inherit"
		aria-current={_ariaCurrent}
	>
		<slot />
	</a>
{/if}
