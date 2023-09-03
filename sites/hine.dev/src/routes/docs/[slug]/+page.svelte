<script>
	import { Icon, Markdown, Shell, Sidebar } from '@hinejs/svelte-ui/components';
	import { mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js';
	import { page } from '$app/stores';
	import { siGithub, siNpm } from 'simple-icons';
	import { createDarkModeButton } from '@hinejs/svelte-ui/creators';

	export let data;

	const darkMode = createDarkModeButton();
	const { button } = darkMode.elements;
	const { mode } = darkMode.state;

	let darkModeIcon = '';
	let darkModeLabel = '';
	$: {
		if ($mode === 'dark') {
			darkModeIcon = mdiWhiteBalanceSunny;
			darkModeLabel =  'Switch to light mode';
		} else if ($mode === 'light') {
			darkModeIcon = mdiWeatherNight;
			darkModeLabel  = 'Switch to dark mode';
		}
	}

	/** @type {string} */
	let title;
	$: {
		if (data.content.data) {
			title = /** @type {{ title: string }} */(data.content.data.frontmatter).title
		}
	}
</script>

<Shell.Root>
	<Shell.Navbar>
		<a href="/" class="text-xl uppercase lg:px-6">hine</a>
		<div class="ml-auto flex gap-1 lg:pr-6">
			<Icon.Link href="https://github.com/kwangure/hine" label="GitHub" path={siGithub.path}/>
			<Icon.Link href="https://www.npmjs.com/package/hine" label="NPM" path={siNpm.path}/>
			<Icon.Button use={button} label={darkModeLabel} path={darkModeIcon}/>
		</div>
	</Shell.Navbar>
	<Sidebar.Root>
		{#each data.groups as group}
			<Sidebar.Section title={group.data_title}>
				{#each group.docs as entry}
					<Sidebar.Item>
						<Sidebar.Link href="/docs/{entry.id}">
							{entry.data_title}
						</Sidebar.Link>
						{#if $page.url.pathname === `/docs/${entry.id}`}
							<Sidebar.Outline toc={entry.headingTree} />
						{/if}
					</Sidebar.Item>
				{/each}
			</Sidebar.Section>
		{/each}
	</Sidebar.Root>
	<Shell.Main>
		<div class="mb-40 lg:px-6">
			<h1 class="mb-2 mt-4 flex scroll-mt-[var(--svui-navbar-height)] text-3xl font-semibold tracking-tight text-neutral-900 dark:text-slate-200 sm:text-4xl">
				{title}
			</h1>
			<Markdown.Children node={data.content} />
		</div>
	</Shell.Main>
</Shell.Root>
