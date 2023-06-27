<script>
	import { eatUntil } from 'parserer';

	/** @type {string} */
	export let code;
	/** @type {import('parserer').WritableParserWithContext} */
	export let parser;

	$: ({ index } = $parser.context);
	$: charRange = Array(code.length)
		.fill(0)
		.map((_, i) => ({
			index: i,
			previous: i < index,
			current: i === index,
			next: i > index,
		}));

	/** @param {number} index */
	function onClick(index) {
		parser.dispatch('RESET');
		eatUntil(parser, code, index);
	}

	/** @param {number} index */
	function onEnter(index) {
		/**
		 * @type {import('svelte/elements').KeyboardEventHandler<HTMLDivElement>}
		 */
		return (event) => {
			if (event.key === 'Enter') {
				parser.dispatch('RESET');
				eatUntil(parser, code, index);
			}
		};
	}
</script>

<div class="my-1 flex h-1 items-center">
	{#each charRange as { current, index, next, previous }}
		<div
			class="h-1 flex-1 cursor-pointer hover:h-2 hover:rounded-sm"
			class:rounded-l-sm={index === 0}
			class:current
			class:previous
			class:next
			on:click={() => onClick(index)}
			on:keydown={onEnter(index)}
		/>
	{/each}
	<div
		class="h-1 flex-1 cursor-pointer rounded-r-sm hover:h-2 {code.length ===
			$parser.context.index && $parser.matches('parser.eof')
			? 'previous'
			: 'eof'}"
		on:click={() => eatUntil(parser, code, index)}
		on:keydown={onEnter(index)}
	/>
</div>

<style>
	.previous {
		background-color: hsl(var(--previous-bg-color));
	}
	.current {
		background-color: hsl(var(--current-bg-color));
	}
	.next {
		background-color: hsl(var(--next-bg-color));
	}
	.eof {
		background-color: hsl(var(--eof-bg-color));
	}
</style>
