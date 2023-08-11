<script>
	import { Icon, Markdown, Shell, Sidebar } from '@hinejs/svelte-ui/components';
	import { siGithub } from 'simple-icons';
	import { SidebarItem } from '$lib/components/index.js';

	export let data;
</script>

<Shell.Root>
	<Shell.Navbar>
		<a href="/" class="px-6 text-xl uppercase">hine</a>
		<a class="ml-auto px-4" href="https://github.com/kwangure/hine">
			<Icon path={siGithub.path} />
		</a>
	</Shell.Navbar>
	<Sidebar.Root>
		<Sidebar.Section title="getting started">
			<SidebarItem
				href="/docs/introduction"
				toc={data.content.data?.tableOfContents}
			>
				Introduction
			</SidebarItem>
			<SidebarItem
				href="/docs/installation"
				toc={data.content.data?.tableOfContents}
			>
				Quick start
			</SidebarItem>
		</Sidebar.Section>
	</Sidebar.Root>
	<Shell.Main>
		<div class="mx-auto mb-40 max-w-3xl px-12">
			<Markdown.Children node={data.content} />
		</div>
	</Shell.Main>
</Shell.Root>
