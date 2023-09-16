<script>
	import Code from './code.svelte';
	import Heading from './heading.svelte';
	import InlineCode from './inline-code.svelte';
	import List from './list.svelte';
	import ListItem from './list-item.svelte';
	import Paragraph from './paragraph.svelte';
	import ThematicBreak from './thematic-break.svelte';
	import Text from './text.svelte';

	/** @type {import('mdast').Parent} */
	export let node;

	const ignore = ['yaml'];
	/**
	 * Return empty strings to skip rendering nodes
	 *
	 * @type {(node: { type: string }) => string}
	 */
	function notImplemented(node) {
		if (ignore.includes(node.type)) return '';
		console.warn(`'${node.type}' not yet implemented.`, node);
		return '';
	}
</script>

{#each node.children as child}
	{#if child.type === 'code'}
		<Code node={child} />
	{:else if child.type === 'heading'}
		<Heading node={child} />
	{:else if child.type === 'inlineCode'}
		<InlineCode node={child} />
	{:else if child.type === 'list'}
		<List node={child} />
	{:else if child.type === 'listItem'}
		<ListItem node={child} />
	{:else if child.type === 'paragraph'}
		<Paragraph node={child} />
	{:else if child.type === 'text'}
		<Text node={child} />
	{:else if child.type === 'thematicBreak'}
		<ThematicBreak />
	{:else}
		{notImplemented(child)}
	{/if}
{/each}
