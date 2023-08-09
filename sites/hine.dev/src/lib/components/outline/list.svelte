<script>
	import Heading from './heading.svelte';

	/** @type {import('./types.js').HeadingWithData[]} */
	export let headings;
	/** @type {string | undefined} */
	export let activeTarget;
</script>

{#if headings.length}
	<ul class="flex flex-col gap-1">
		{#each headings as heading}
			<Heading {activeTarget} self={heading} />
		{/each}
	</ul>
{/if}
