<script>
	import { Icon, Shell, Sidebar } from '@hinejs/svelte-ui/components';
	import { siGithub } from 'simple-icons';
</script>

<Shell.Root>
	<Shell.Navbar>
		<a href="/" class="px-6 text-xl uppercase">hine</a>
		<a class="ml-auto px-4" href="https://github.com/kwangure/hine">
			<Icon path={siGithub.path} />
		</a>
	</Shell.Navbar>
	<Sidebar.Primary>
		<Sidebar.Section title="getting started">
			<li>
				<Sidebar.Link href="/docs/introduction">Introduction</Sidebar.Link>
			</li>
			<li>
				<Sidebar.Link href="/docs/installation">Installation</Sidebar.Link>
			</li>
		</Sidebar.Section>
	</Sidebar.Primary>
	<slot />
</Shell.Root>
