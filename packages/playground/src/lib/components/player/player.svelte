<script>
	import '../code.css';
	import { eatUntil, highlightParsed, parseFile } from 'parserer';
	import {
		mdiPlay,
		mdiRestore,
		mdiSkipNext,
		mdiSkipPrevious,
		mdiStepBackward,
		mdiStepForward,
	} from '@mdi/js';
	import { Icon } from '$lib/components';
	import Scrubber from './scrubber.svelte';
	import { stateEventNames } from 'hine';

	/** @type {string} */
	export let code;
	/** @type {string} */
	export let next;
	/** @type {string} */
	export let previous;
	/** @type {import('parserer').WritableParserWithContext} */
	export let parser;

	$: ({ index } = $parser.context);
	$: segments = highlightParsed(code, index);
	$: stateEvents = stateEventNames($parser);

	function stepForward() {
		if (parser.context.index < code.length) {
			eatUntil(parser, code, parser.context.index + 1);
		} else {
			parser.dispatch('EOF');
		}
	}

	function stepBackward() {
		if (!parser.context.index) return;
		const parseUntil = parser.matches('parser.eof')
			? parser.context.index
			: parser.context.index - 1;
		parser.dispatch('RESET');
		eatUntil(parser, code, parseUntil);
	}
</script>

<div class="player min-w-fit rounded">
	<code
		class="border-neutral block min-w-fit whitespace-pre rounded border border-neutral-300 bg-zinc-100 px-4 py-3 text-sm dark:border-neutral-600 dark:bg-zinc-900"
	>
		{#each segments as { color, segment, status }}
			<span class="br-token-{color} {status}">{segment}</span>
		{/each}
		<span
			class:previous={$parser.matches('parser.eof')}
			class:current={code.length === index && !$parser.matches('parser.eof')}
			class="eof rounded-sm px-0.5">EOF</span
		>
	</code>
	<Scrubber {code} {parser} />
	<div>
		{#if previous}
			<a
				role="button"
				href="/parser/sample/{previous}"
				title="Go to previous test sample"
			>
				<Icon path={mdiSkipPrevious} />
			</a>
		{/if}
		<button on:click={stepBackward} title="Step one character backward">
			<Icon path={mdiStepBackward} />
		</button>
		{#if !$parser.matches('parser.eof')}
			<button
				on:click={() => parseFile(parser, code)}
				title="Parse to end of file"
			>
				<Icon path={mdiPlay} />
			</button>
			<button on:click={stepForward} title="Step one character forward">
				<Icon path={mdiStepForward} />
			</button>
		{/if}
		{#if next}
			<a
				role="button"
				href="/parser/sample/{next}"
				title="Go to next test sample"
			>
				<Icon path={mdiSkipNext} />
			</a>
		{/if}
		{#if stateEvents.includes('RESET')}
			<button
				on:click={() => parser.dispatch('RESET')}
				title="Reset cursor to start"
			>
				<Icon path={mdiRestore} />
			</button>
		{/if}
	</div>
</div>

<style>
	.player {
		--previous-bg-color: 144deg 55% 49%;
		--current-bg-color: 0deg 0% 100%;
		--current-color: 145deg 55% 20%;
		--next-bg-color: var(--br-light, 215deg 100% 85%)
			var(--br-dark, 0deg 0% 50%);
		--eof-bg-color: 205deg 55% 49%;
	}
	button,
	a[role='button'] {
		border: 1px solid transparent;
		background-color: #333;
	}
	.previous:not(.eof) {
		background-color: hsl(var(--previous-bg-color) / 40%);
	}
	.current:not(.eof) {
		color: hsl(var(--current-color)) !important;
		background-color: hsl(var(--current-bg-color));
		border-radius: 2px;
	}
	.eof {
		margin-left: -1ch;
		border: 1px solid hsl(var(--eof-bg-color));
		color: hsl(var(--eof-bg-color) / 80%);
	}
	.eof.current {
		color: #fff;
		background-color: hsl(var(--eof-bg-color) / 80%);
	}
	.eof.previous {
		color: #fff;
		border-color: hsl(var(--previous-bg-color));
		background-color: hsl(var(--previous-bg-color) / 80%);
	}
	.scrubber {
		background-color: #aaa;
		height: 3px;
	}
	.progress {
		background-color: var(--br-dark, hsl(225deg 100% 60%))
			var(--br-light, hsl(225deg 100% 55%));
		height: 100%;
	}
</style>
