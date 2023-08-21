<script>
	import './layout.css';
	import { Shell, Sidebar } from '../lib/components/index.js';
</script>

<Shell.Root>
	<Sidebar.Root>
		<Sidebar.Section title="layout">
			<Sidebar.Item>
				<Sidebar.Link href="#test">Shell</Sidebar.Link>
			</Sidebar.Item>
			<Sidebar.Item>
				<Sidebar.Link href="#test">Sidebar</Sidebar.Link>
			</Sidebar.Item>
		</Sidebar.Section>
	</Sidebar.Root>
	<slot />
</Shell.Root>
