<script>
	import { getSidebarContext } from './sidebar.js';
	import { page } from '$app/stores';

	/** @type {'location' | 'page' | boolean | null | undefined} */
	export let ariaCurrent = undefined;
	/** @type {string} */
	export let href;
	/** @type {boolean} */
	export let secondary = false;

	const sidebar = getSidebarContext();

	$: _ariaCurrent = computeAriaCurrent(href, $page.url.pathname, ariaCurrent);

	/**
	 * @param {string} href
	 * @param {string} pathname
	 * @param {'location' | 'page' | boolean | null} [userAriaCurrent]
	 */
	export function computeAriaCurrent(href, pathname, userAriaCurrent) {
		if (userAriaCurrent !== undefined) return userAriaCurrent;
		if (href[0] === '#') {
			if (location.hash === href) return true;
			return null;
		}

		if (href[0] !== '/') return null;

		if (href.endsWith('/')) href = href.slice(0, href.length - 1);
		if (pathname === href) return 'page';
		if (pathname.startsWith(`${href}/`)) return 'location';

		return null;
	}
</script>

{#if _ariaCurrent}
	<a
		{href}
		class="flex cursor-pointer items-center gap-2 rounded px-4 py-1 dark:bg-neutral-700 dark:text-inherit dark:hover:bg-neutral-500 dark:hover:text-inherit"
		class:bg-blue-100={!secondary}
		class:hover:bg-blue-200={!secondary}
		class:hover:text-blue-700={!secondary}
		class:text-blue-600={!secondary}
		class:bg-neutral-200={secondary}
		class:hover:bg-neutral-300={secondary}
		aria-current={_ariaCurrent}
		use:sidebar.elements.hide
	>
		<slot />
	</a>
{:else}
	<a
		{href}
		class="flex cursor-pointer items-center gap-2 rounded px-4 py-1 hover:bg-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-inherit"
		aria-current={_ariaCurrent}
		use:sidebar.elements.hide
	>
		<slot />
	</a>
{/if}
