<script>
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { isPartiallyHidden } from '$lib/dom/dom.js';
	import List from './list.svelte';
	import { page } from '$app/stores';

	/** @type {import('mdast').RootData['tableOfContents']} */
	export let toc;

	/** @type {string | undefined} */
	let activeTarget = undefined;

	function updateActiveSlug() {
		for (const heading of toc) {
			const element = document.getElementById(heading.slug);
			if (!element) continue;
			if (isPartiallyHidden(element)) continue;

			activeTarget = heading.slug;
			return;
		}
	}

	afterNavigate(updateActiveSlug);

	onMount(async () => {
		await document.fonts.ready;

		updateActiveSlug();
	});

	/**
	 * Prioritize the changed hash over the output of the algorithm in
	 * `updateActiveSlug()`
	 *
	 * @param {URL} url
	 * @link {https://github.com/sveltejs/kit/blob/a6fe5fcb1c7258281b4bf53b94543272e6e6c6d8/sites/kit.svelte.dev/src/routes/docs/%5Bslug%5D/OnThisPage.svelte#L67}
	 */
	function preferHashchangeTarget(url) {
		const update = () => (activeTarget = url.hash);

		// belt...
		queueMicrotask(update);

		// ...and braces
		addEventListener('scroll', update, { once: true });
	}
</script>

<svelte:window
	on:scroll={updateActiveSlug}
	on:hashchange={() => preferHashchangeTarget($page.url)}
/>

<h5
	class="whitespace-nowrap bg-white pb-1 pt-2 text-xs font-semibold uppercase text-neutral-900 dark:bg-neutral-800 dark:text-neutral-400"
>
	On this page
</h5>
<List {activeTarget} {toc} />
