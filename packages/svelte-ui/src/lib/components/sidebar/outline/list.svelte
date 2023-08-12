<script>
	import Heading from './heading.svelte';

	/** @type {string | undefined} */
	export let activeTarget;
	/** @type {import('@hinejs/vite-plugin-markdown').TocEntry[]} */
	export let toc;
</script>

{#if toc.length}
	<ul class="flex flex-col gap-1">
		{#each toc as heading}
			<Heading {activeTarget} self={heading} />
		{/each}
	</ul>
{/if}
