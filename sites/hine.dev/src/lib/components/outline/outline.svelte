<script>
	import { onMount } from 'svelte';
	import { isPartiallyHidden } from '$lib/dom/dom.js';
	import List from './list.svelte';

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

	onMount(() => {
		document.fonts.ready.then(() => {
			// Initialize the active link
			updateActiveSlug();
			// Attach the scroll event listener to the main content
			window.addEventListener('scroll', updateActiveSlug);
		});

		return () => {
			// Remove the event listener when the component is destroyed
			window.removeEventListener('scroll', updateActiveSlug);
		};
	});
</script>

<h5
	class="whitespace-nowrap bg-white pb-1 pt-2 text-xs font-semibold uppercase text-neutral-900 dark:bg-neutral-800 dark:text-neutral-400"
>
	On this page
</h5>
<List {activeTarget} {toc} />
