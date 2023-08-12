<script>
	import Children from './children.svelte';
	/** @type {import('mdast').Paragraph} */
	export let node;
</script>

<p class="mb-4 leading-7">
	<Children {node} />
</p>
