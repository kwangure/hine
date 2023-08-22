<script>
	import { Icon, Markdown, Shell, Sidebar } from '@hinejs/svelte-ui/components';
	import { siGithub } from 'simple-icons';
	import { SidebarItem } from '$lib/components/index.js';

	export let data;
</script>

<Shell.Root>
	<Shell.Navbar>
		<a href="/" class="text-xl uppercase lg:px-6">hine</a>
		<a class="ml-auto px-4" href="https://github.com/kwangure/hine">
			<Icon path={siGithub.path} />
		</a>
	</Shell.Navbar>
	<Sidebar.Root>
		{#each data.groups as group}
			<Sidebar.Section title={group.data.title}>
				{#each group.entries as entry}
					<SidebarItem href={entry.path} toc={entry.children}>
						{entry.value}
					</SidebarItem>
				{/each}
			</Sidebar.Section>
		{/each}
	</Sidebar.Root>
	<Shell.Main>
		<div class="mb-40 lg:px-6">
			<Markdown.Children node={data.content} />
		</div>
	</Shell.Main>
</Shell.Root>
