<script>
	import { Shell, Sidebar } from '@hinejs/svelte-ui/components';
</script>

<Shell.Root>
	<Sidebar.Root slot="sidebar">
		<Sidebar.Section title="getting started">
			<Sidebar.Link href="/docs/introduction">Introduction</Sidebar.Link>
			<Sidebar.Link href="/docs/installation">Installation</Sidebar.Link>
		</Sidebar.Section>
	</Sidebar.Root>
	<slot />
</Shell.Root>
