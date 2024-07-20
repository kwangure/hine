<script>
	import { Outline, Shell, Sidebar } from '@svelte-thing/components';
	import * as Markdown from '@content-thing/svelte-components';
	import { page } from '$app/stores';

	export let data;
</script>

<svelte:head>
	<title>{data.entry.title} - Hine</title>
</svelte:head>

<Sidebar.Root>
	{#each data.groups as group}
		{#if group.guides.length}
			<Sidebar.Section title={group.title}>
				{#each group.guides as entry}
					<Sidebar.Item>
						<Sidebar.Link
							href="/guide/{entry._id}"
							ariaCurrent={$page.url.pathname ===
								`/guide/${entry._id}`}
						>
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
		<h1
			class="font-semibold tracking-tight text-neutral-900 dark:text-slate-200 sm:text-4xl"
		>
			{data.entry.title}
		</h1>
		<Markdown.Children node={data.entry._content} />
	</div>
	<Outline.Root toc={data.entry._headingTree} />
</Shell.Main>

<style>
	div {
		padding-inline: var(--st-breakpoint-lg) var(--st-size-6);
		margin-block-end: var(--st-size-40);
	}
	h1 {
		--_color-dark: var(--st-color-preference-dark)
			var(--st-color-neutral-200);
		color: var(--_color-dark, --st-color-neutral-900);
		display: flex;
		--_font-size-sm: var(--st-breakpoint-sm) var(--st-size-9);
		font-size: var(--_font-size-sm, --st-size-7_5);
		font-weight: 600;
		letter-spacing: -0.025em;
		--_line-height-sm: var(--st-breakpoint-sm) var(--st-size-10);
		line-height: var(--_line-height-sm, --st-size-9);
		margin-block-end: var(--st-size-2);
		margin-block-start: var(--st-size-4);
		scroll-margin-block-start: calc(
			var(--st-navbar-height) + var(--st-navbar-y-gap)
		);
	}
</style>
