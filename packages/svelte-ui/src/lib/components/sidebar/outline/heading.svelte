<script>
	import { Sidebar } from '@hinejs/svelte-ui/components';
	import List from './list.svelte';

	/** @type {import('./types.js').TocEntry} */
	export let self;
	/** @type {string | undefined} */
	export let activeTarget;
</script>

<Sidebar.Item>
	<div class:pl-5={self.depth == 2} class:pl-10={self.depth == 3}>
		<Sidebar.Link
			secondary
			href="#{self.slug}"
			ariaCurrent={self.slug === activeTarget}
		>
			{self.content}
		</Sidebar.Link>
	</div>
	<List {activeTarget} toc={self.children} />
</Sidebar.Item>
