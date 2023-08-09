<script>
	import { Sidebar } from '@hinejs/svelte-ui/components';
	import List from './list.svelte';

	/** @type {import('@hinejs/vite-plugin-markdown').TocEntry} */
	export let self;
	/** @type {string | undefined} */
	export let activeTarget;
</script>

<li class="flex flex-col gap-1">
	<div class:pl-5={self.depth == 3}>
		<Sidebar.Link href="#{self.slug}" ariaCurrent={self.slug === activeTarget}>
			{self.content}
		</Sidebar.Link>
	</div>
	<List {activeTarget} toc={self.children} />
</li>
