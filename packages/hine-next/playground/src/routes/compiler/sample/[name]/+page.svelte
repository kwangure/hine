<script>
	import { compile, createParser, parseFile } from 'hine-next';

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
	};
</script>

<div class="flex text-sm gap-2">
	<code class='px-5 py-4 whitespace-pre border dark:border-gray-700 block rounded'>
		{data.sample.content}
	</code>
	<code class='px-5 py-4 whitespace-pre border dark:border-gray-700 block rounded'>
		{js}
	</code>
</div>