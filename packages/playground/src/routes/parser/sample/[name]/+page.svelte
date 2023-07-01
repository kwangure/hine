<script>
	import { activePath, stateEventNames } from 'hine';
	import { Button, Code, Player } from '$lib/components';
	import { createParser, toSvelteAST } from 'parserer';
	import { beforeNavigate } from '$app/navigation';
	import { parse } from 'svelte/compiler';

	export let data;

	const parser = createParser();

	/** @type {'parserer' | 'stack' | 'svelte'} */
	let shownPanel = 'stack';

	$: stateEvents = stateEventNames($parser);
	$: astJSON = JSON.stringify(toSvelteAST($parser), null, 4);
	$: stackJSON = JSON.stringify($parser.context.stack, null, 4);

	beforeNavigate(() => {
		parser.dispatch('RESET');
	});

	/**
	 * @param {string} code
	 */
	function svelte(code) {
		try {
			return JSON.stringify(parse(code), null, 4);
		} catch (error) {
			console.error(error);
			return String(error);
		}
	}
</script>

<div class="">
	State Events: {stateEvents}
</div>
<div class="">
	Active Path: {activePath($parser)}
</div>
<div class="">
	Index: {$parser.context.index}
</div>
<div class="grid grid-cols-2 gap-2">
	<Player
		code={data.sample.content}
		next={data.next}
		previous={data.previous}
		{parser}
	/>
	<div>
		<div>
			<Button
				primary={shownPanel === 'stack'}
				on:click={() => (shownPanel = 'stack')}
			>
				Stack
			</Button>
			<Button
				primary={shownPanel === 'parserer'}
				on:click={() => (shownPanel = 'parserer')}
			>
				Parserer AST
			</Button>
			<Button
				primary={shownPanel === 'svelte'}
				on:click={() => (shownPanel = 'svelte')}
			>
				Svelte AST
			</Button>
		</div>
		{#if shownPanel === 'stack'}
			<Code language="json" code={stackJSON} />
		{:else if shownPanel === 'parserer'}
			<Code language="json" code={astJSON} />
		{:else if shownPanel === 'svelte'}
			<Code language="json" code={svelte(data.sample.content)} />
		{/if}
	</div>
</div>
