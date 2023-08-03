<script>
	import './layout.css';
	import { Shell, Sidebar } from '$lib/components';
</script>

<Shell.Root>
	<Sidebar.Root slot="sidebar">
		<Sidebar.Section title="layout">
			<Sidebar.Link href="#test">Shell</Sidebar.Link>
			<Sidebar.Link href="#test">Sidebar</Sidebar.Link>
		</Sidebar.Section>
	</Sidebar.Root>
	<slot />
</Shell.Root>
