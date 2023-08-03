<script>
	import { Shell, Sidebar } from '@hinejs/svelte-ui/components';
</script>

<Shell.Root>
	<Sidebar.Root slot="sidebar">
		<Sidebar.Section title="getting started">
			<Sidebar.Link href="#test">Introduction</Sidebar.Link>
			<Sidebar.Link href="#test">Quickstart</Sidebar.Link>
		</Sidebar.Section>
	</Sidebar.Root>
	<slot />
</Shell.Root>
