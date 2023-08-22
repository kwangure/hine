<script>
	import { Icon, Markdown, Shell, Sidebar } from '@hinejs/svelte-ui/components';
	import { siGithub } from 'simple-icons';
	import { SidebarItem } from '$lib/components/index.js';

	export let data;

	$: console.log({ data: data.content.data });
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
						{entry.title}
					</SidebarItem>
				{/each}
			</Sidebar.Section>
		{/each}
	</Sidebar.Root>
	<Shell.Main>
		<div class="mb-40 lg:px-6">
			<h1 class="mb-2 mt-4 flex scroll-mt-[var(--svui-navbar-height)] text-3xl font-semibold tracking-tight text-neutral-900 dark:text-slate-200 sm:text-4xl">
			{data.content.data?.frontmatter.title}
	</h1>
			<Markdown.Children node={data.content} />
		</div>
	</Shell.Main>
</Shell.Root>
