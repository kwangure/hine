<script>
	import '../../code/code.css';
	import { multiHighlight } from '../../code/multi-language.js';

	/** @type {import('mdast').InlineCode} */
	export let node;

	$: segments = multiHighlight(node.value, /** @type {{ lang: string | undefined }} */(node.data?.attributes).lang);
</script>

<code
	class="inline rounded border border-neutral-300 bg-zinc-800 px-1 py-0.5 text-sm text-neutral-200 dark:border-neutral-600 dark:bg-zinc-900 dark:text-neutral-200"
>
	{#each segments as { color, segment }}
		<span class={color}>{segment}</span>
	{/each}
</code>
