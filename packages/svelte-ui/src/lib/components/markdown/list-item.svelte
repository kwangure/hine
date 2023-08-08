<script>
	import Children from './children.svelte';

	/** @type {import('mdast').ListItem} */
	export let node;
</script>

<li>
	<Children {node} />
</li>
