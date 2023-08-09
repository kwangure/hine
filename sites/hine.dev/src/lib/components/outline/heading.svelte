<script>
	import { Sidebar } from '@hinejs/svelte-ui/components';
	import List from './list.svelte';

	/** @type {import('./types.js').HeadingWithData} */
	export let self;
	/** @type {string | undefined} */
	export let activeTarget;
</script>

<li class="flex flex-col gap-1">
	<Sidebar.Link
		href="#{self.data.slug}"
		ariaCurrent={self.data.slug === activeTarget}
	>
		{self.data.content}
	</Sidebar.Link>
	<List {activeTarget} headings={self.data.children} />
</li>
