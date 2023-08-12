<script>
	import Children from './children.svelte';

	/** @type {import('mdast').List} */
	export let node;
</script>

{#if node.ordered}
	<ol class="list-decimal">
		<Children {node} />
	</ol>
{:else}
	<ul class="list-disc">
		<Children {node} />
	</ul>
{/if}
