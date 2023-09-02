<script>
	import { Sidebar } from '../../index.js';
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
			href={self.hash}
			ariaCurrent={self.id === activeTarget}
		>
			{self.value}
		</Sidebar.Link>
	</div>
	<List {activeTarget} toc={self.children} />
</Sidebar.Item>
