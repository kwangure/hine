<script>
	import { Icon, Shell, Sidebar } from '@hinejs/svelte-ui/components';
	import { siGithub } from 'simple-icons';
</script>

<div class="grid h-full grid-rows-[max-content_1fr]">
	<nav class="flex h-14 items-center px-5">
		<a href="/" class="text-xl uppercase">hine</a>
		<a class="ml-auto px-4" href="https://github.com/kwangure/hine">
			<Icon path={siGithub.path} />
		</a>
	</nav>
	<Shell.Root>
		<Sidebar.Root slot="sidebar">
			<Sidebar.Section title="getting started">
				<Sidebar.Link href="/docs/introduction">Introduction</Sidebar.Link>
				<Sidebar.Link href="/docs/installation">Installation</Sidebar.Link>
			</Sidebar.Section>
		</Sidebar.Root>
		<slot />
	</Shell.Root>
</div>
