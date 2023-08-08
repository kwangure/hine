<script>
	import { Markdown } from '@hinejs/svelte-ui/components';
	import { OnThisPage } from '$lib/components/index.js';

	export let data;
</script>

<div class="grid grid-cols-[1fr_max-content]">
	<div id="main-content" class="mx-auto max-w-4xl px-4 pb-8 sm:px-6 md:px-8">
		<Markdown.Children node={data.content} />
	</div>
	<OnThisPage content={data.content} />
</div>
