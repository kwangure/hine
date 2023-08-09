<script>
	import { Markdown, Shell, Sidebar } from '@hinejs/svelte-ui/components';
	import { OnThisPage } from '$lib/components/index.js';

	export let data;
</script>

<!--
	Even though the secondary sidebar is to the right of content visually,
	place it before content in the DOM so that keyboard-only users can jump to
	a section if needed
-->
<Sidebar.Secondary>
	<OnThisPage content={data.content} />
</Sidebar.Secondary>
<Shell.Main>
	<div class="mx-auto mb-40 max-w-3xl px-12">
		<Markdown.Children node={data.content} />
	</div>
</Shell.Main>
