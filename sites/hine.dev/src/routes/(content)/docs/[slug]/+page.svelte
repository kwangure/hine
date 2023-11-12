<script>
	import { Markdown, Outline, Shell, Sidebar } from '@svelte-thing/components';
	import { page } from '$app/stores';

	export let data;

	/** @type {string} */
	let title;
	$: {
		if (data.entry._content.data) {
			title = /** @type {{ frontmatter: { title: string }}} */(data.entry._content.data).frontmatter.title
		}
	}
</script>

<svelte:head>
	<title>{title} - Hine</title>
</svelte:head>

<Sidebar.Root>
	{#each data.groups as group}
		{#if group.docs.length}
			<Sidebar.Section title={group.title}>
				{#each group.docs as entry}
					<Sidebar.Item>
						<Sidebar.Link href="/docs/{entry._id}" ariaCurrent={$page.url.pathname === `/docs/${entry._id}`}>
							{entry.title}
						</Sidebar.Link>
					</Sidebar.Item>
				{/each}
			</Sidebar.Section>
		{/if}
	{/each}
</Sidebar.Root>
<Shell.Main>
	<div class="mb-40 lg:px-6">
		<h1 class="mb-2 mt-4 flex scroll-mt-[calc(var(--st-navbar-height)+var(--st-navbar-y-gap))] text-3xl font-semibold tracking-tight text-neutral-900 dark:text-slate-200 sm:text-4xl">
			{title}
		</h1>
		<Markdown.Children node={data.entry._content} />
	</div>
	<Outline.Root toc={data.entry._headingTree} />
</Shell.Main>
