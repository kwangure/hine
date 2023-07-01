<script>
	import { Button, Code } from '$lib/components';
	import { createParser, parseFile } from 'parserer';
	import { compile } from 'hine-next/compiler';
	import { generate } from 'hine-next/codegen';

	const json = (/** @type {any} */ value) => JSON.stringify(value, null, 4);
	export let data;

	const parser = createParser();
	/** @type {import('parserer').PFragmentJSON} */
	let ast;
	/** @type {ReturnType<compile>} */
	let cir;
	/** @type {string} */
	let js;

	/** @type {'ast' | 'cir' | 'stack' | 'codegen'} */
	let showPanel = 'codegen';

	$: {
		parseFile($parser, data.sample.content);
		ast = $parser.context.html.toJSON();
		cir = compile(ast);
		js = generate(cir);
	}
</script>

<div>Sample</div>
<div>
	<Button
		primary={showPanel === 'stack'}
		on:click={() => (showPanel = 'stack')}
	>
		Stack
	</Button>
	<Button primary={showPanel === 'ast'} on:click={() => (showPanel = 'ast')}>
		AST
	</Button>
	<Button primary={showPanel === 'cir'} on:click={() => (showPanel = 'cir')}>
		CIR
	</Button>
	<Button
		primary={showPanel === 'codegen'}
		on:click={() => (showPanel = 'codegen')}
	>
		Codegen
	</Button>
</div>
<Code language="svelte" code={data.sample.content} />
<div class="max-h-full min-h-0 overflow-y-auto">
	{#if showPanel === 'stack'}
		<Code language="json" code={json($parser.context.stack)} />
	{:else if showPanel === 'ast'}
		<Code language="json" code={json(ast)} />
	{:else if showPanel === 'cir'}
		<Code language="json" code={json(cir)} />
	{:else if showPanel === 'codegen'}
		<Code language="javascript" code={js} />
	{/if}
</div>
