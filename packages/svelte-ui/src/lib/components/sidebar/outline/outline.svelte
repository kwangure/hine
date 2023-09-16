<script>
	import { afterNavigate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { isPartiallyHidden } from '../../../dom/dom.js';
	import List from './list.svelte';
	import { page } from '$app/stores';

	/** @type {import('./types.js').TocEntry[]} */
	export let toc;

	/** @type {string} */
	let activeTarget = toc[0]?.id;

	/**
	 * Set the first visible heading as active
	 *
	 * @param {import('./types.js').TocEntry[]} tree
	 */
	function updateActiveSlug(tree) {
		for (const heading of tree) {
			const element = document.getElementById(heading.id);
			if (!element) continue;
			if (isPartiallyHidden(element)) continue;

			activeTarget = heading.id;
			return true;
		}

		for (const heading of tree) {
			const activeTargetFound = updateActiveSlug(heading.children);
			if (activeTargetFound) return true;
		}

		// Assume the last heading was scrolled up and out of the viewport
		const lastChild = tree.at(-1);
		const deepestLeaf = lastChild?.children.at(-1) || lastChild;
		if (deepestLeaf) {
			activeTarget = deepestLeaf.id;
			return true;
		}
	}

	afterNavigate(() => updateActiveSlug(toc));

	onMount(async () => {
		await document.fonts.ready;

		updateActiveSlug(toc);
	});

	/**
	 * Prioritize the changed hash over the output of the algorithm in
	 * `updateActiveSlug()`
	 *
	 * @param {URL} url
	 * @link {https://github.com/sveltejs/kit/blob/a6fe5fcb1c7258281b4bf53b94543272e6e6c6d8/sites/kit.svelte.dev/src/routes/docs/%5Bslug%5D/OnThisPage.svelte#L67}
	 */
	function preferHashchangeTarget(url) {
		const update = () => (activeTarget = url.hash.slice(1));

		// belt...
		queueMicrotask(update);

		// ...and braces
		addEventListener('scroll', update, { once: true });
	}
</script>

<svelte:window
	on:scroll={() => updateActiveSlug(toc)}
	on:hashchange={() => preferHashchangeTarget($page.url)}
/>

<List {activeTarget} {toc} />
