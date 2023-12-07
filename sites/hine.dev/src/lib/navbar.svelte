<script>
	import { Icon, Navbar } from '@svelte-thing/components';
	import { mdiBookOutline, mdiBookOpenPageVariantOutline, mdiDotsVertical, mdiWeatherNight, mdiWhiteBalanceSunny } from '@mdi/js';
	import { siGithub, siNpm } from 'simple-icons';
	import { createDarkModeButton } from '@svelte-thing/components/creators';
	import Dropdown from '$lib/dropdown.svelte';
	import { wordmark } from '@hine/assets';

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
</script>

<Navbar.Root>
	<a href="/" class="text-xl uppercase lg:px-6">
		<svg viewBox={wordmark.viewBox} height="20px">
			<path d={wordmark.path} fill="currentColor"/>
		</svg>
	</a>
	<div class="ml-auto gap-1 hidden lg:flex">
		<Navbar.Link href="/docs">Docs</Navbar.Link>
		<Navbar.Link href="/reference">Reference</Navbar.Link>
		<Navbar.Link href="/examples">Examples</Navbar.Link>
		<Icon.Link href="https://github.com/kwangure/hine" label="GitHub" path={siGithub.path}/>
		<Icon.Link href="https://www.npmjs.com/package/hine" label="NPM" path={siNpm.path}/>
		<Icon.Button action={button} label={darkModeLabel} path={darkModeIcon}/>
	</div>
	<div class="ml-auto flex lg:hidden">
		<Dropdown placement='bottom-end' let:item let:menu>
			<Icon.Button slot="trigger" let:trigger action={trigger.action} props={trigger.props} path={mdiDotsVertical} label="Navigation"/>
			<div class="flex flex-col border border-neutral-300 dark:border-neutral-600 rounded shadow-lg z-40 p-2 min-w-[10rem] lg:hidden dark:shadow-lg-dark dark:bg-neutral-800 bg-white" {...menu.props} use:menu.action>
				<Navbar.Link action={item.action} props={item.props} href="/docs">
					<Icon.Simple path={mdiBookOutline}/>
					Docs
				</Navbar.Link>
				<Navbar.Link action={item.action} props={item.props} href="/reference">
					<Icon.Simple path={mdiBookOutline}/>
					Reference
				</Navbar.Link>
				<Navbar.Link action={item.action} props={item.props} href="/examples">
					<Icon.Simple path={mdiBookOpenPageVariantOutline}/>
					Examples
				</Navbar.Link>
				<Navbar.Link action={item.action} props={item.props} href="https://github.com/kwangure/hine">
					<Icon.Simple path={siGithub.path}/>
					Github
				</Navbar.Link>
				<Navbar.Link action={item.action} props={item.props} href="https://www.npmjs.com/package/hine">
					<Icon.Simple path={siNpm.path}/>
					NPM
				</Navbar.Link>
				<button
					{...item.props}
					use:item.action
					use:button
					class="flex items-center gap-3 px-2 sm:px-3 py-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700">
					<Icon.Simple path={darkModeIcon}/>
					{darkModeLabel}
				</button>
			</div>
		</Dropdown>
	</div>
</Navbar.Root>
