<script>
	import { createParser, parseFile } from 'parserer';
	import { Code } from '$lib/components';
	import { compile } from 'hine-next';

	export let data;

	const parser = createParser();
	/** @type {string} */
	let ast;
	/** @type {string} */
	let astJSON;
	/** @type {string} */
	let js;

	$: {
		parseFile($parser, data.sample.content);
		ast = $parser.context.html.toJSON();
		astJSON = JSON.stringify(ast, null, 4);
		js = JSON.stringify(compile(ast), null, 4);
	}
</script>

<div class="flex gap-2 text-sm">
	<Code language="svelte" code={data.sample.content} />
	<Code language="json" code={js} />
</div>
