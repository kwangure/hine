<script>
	import './layout.css';
	import { Shell, Sidebar } from '../lib/components/index.js';
</script>

<Shell.Root>
	<Sidebar.Root>
		<Sidebar.Section title="layout">
			<li class="flex flex-col gap-1">
				<Sidebar.Link href="#test">Shell</Sidebar.Link>
			</li>
			<li class="flex flex-col gap-1">
				<Sidebar.Link href="#test">Sidebar</Sidebar.Link>
			</li>
		</Sidebar.Section>
	</Sidebar.Root>
	<slot />
</Shell.Root>
