<script>
	import { Icon, Navbar } from '@svelte-thing/components';
	import {
		// mdiBookOutline,
		// mdiDotsVertical,
		mdiWeatherNight,
		mdiWhiteBalanceSunny,
	} from '@mdi/js';
	import { siGithub, siNpm } from 'simple-icons';
	import { createDarkModeButton } from '@svelte-thing/components/creators';
	// import Dropdown from '$lib/dropdown.svelte';
	// import Search from './search/root.svelte';
	import Wordmark from './wordmark.svelte';

	const darkMode = createDarkModeButton();
	const { button } = darkMode.elements;
	const { mode } = darkMode.state;

	let darkModeIcon = '';
	let darkModeLabel = '';
	$: {
		if ($mode === 'dark') {
			darkModeIcon = mdiWhiteBalanceSunny;
			darkModeLabel = 'Switch to light mode';
		} else if ($mode === 'light') {
			darkModeIcon = mdiWeatherNight;
			darkModeLabel = 'Switch to dark mode';
		}
	}
</script>

<Navbar.Root>
	<Wordmark />
	<div class="actions large">
		<Navbar.Link href="/guide">Guide</Navbar.Link>
		<Icon.Link
			href="https://github.com/kwangure/hine"
			label="GitHub"
			path={siGithub.path}
		/>
		<Icon.Link
			href="https://www.npmjs.com/package/hine"
			label="NPM"
			path={siNpm.path}
		/>
		<Icon.Button
			action={button}
			label={darkModeLabel}
			path={darkModeIcon}
		/>
	</div>
	<!-- TODO: Runes implementation. Melt + Svelte 5 + TypeScript is miserable. -->
	<!-- <div class="actions small">
		<Search />
		<Dropdown placement="bottom-end" let:item let:menu>
			<Icon.Button
				slot="trigger"
				let:trigger
				path={mdiDotsVertical}
				label="Navigation"
				{...trigger.props}
			/>
			<div class="menu" {...menu.props} use:menu.action>
				<Navbar.Link
					{...item.props}
					href="/guide"
				>
					<Icon.Simple path={mdiBookOutline} />
					Guide
				</Navbar.Link>
				<Navbar.Link
					{...item.props}
					href="https://github.com/kwangure/hine"
				>
					<Icon.Simple path={siGithub.path} />
					Github
				</Navbar.Link>
				<Navbar.Link
					action={item.action}
					props={item.props}
					href="https://www.npmjs.com/package/hine"
				>
					<Icon.Simple path={siNpm.path} />
					NPM
				</Navbar.Link>
				<button
					class="darkmode"
					{...item.props}
					use:item.action
					use:button
				>
					<Icon.Simple path={darkModeIcon} />
					{darkModeLabel}
				</button>
			</div>
		</Dropdown>
	</div> -->
</Navbar.Root>

<style>
	.actions {
		margin-inline-start: auto;
	}
	.actions.large {
		--_display-lg: var(--st-breakpoint-lg) flex;
		display: var(--_display-lg, none);
		gap: var(--st-size-1);
	}
	/* .actions.small {
		--_display-lg: var(--st-breakpoint-lg) none;
		display: var(--_display-lg, flex);
	}
	.menu {
		--_background-color-dark: var(--st-color-preference-dark)
			var(--st-color-neutral-800);
		background-color: var(--_background-color-dark, var(--st-color-white));
		--_border-color-dark: var(--st-color-preference-dark)
			var(--st-color-neutral-600);
		border-color: var(--_border-color-dark, var(--st-color-neutral-300));
		border-radius: var(--st-size-1);
		border-width: 1px;
		--_display-lg: var(--st-breakpoint-lg) none;
		display: var(--_display-lg, flex);
		flex-direction: column;
		min-width: var(--st-size-40);
		padding: var(--st-size-2);
		--_box-shadow-dark: var(--st-color-preference-dark) 0 10px 15px -3px rgb(0
						0 0 / 0.25),
			0 4px 6px -4px rgb(0 0 0 / 0.1);
		box-shadow: var(
			--_box-shadow-dark,
			0 10px 15px -3px rgb(0 0 0 / 0.1),
			0 4px 6px -4px rgb(0 0 0 / 0.1)
		);
		z-index: 40;
	}
	button.darkmode {
		align-items: center;
		border-radius: var(--st-size-1);
		display: flex;
		gap: var(--st-size-3);
		padding-block: var(--st-size-1);
		--_padding-inline-sm: var(--st-breakpoint-sm) var(--st-size-3);
		padding-inline: var(--_padding-inline-sm, --st-size-2);
	}
	button.darkmode:hover {
		--_background-color-dark: var(--st-color-preference-dark)
			var(--st-color-neutral-700);
		background-color: var(
			--_background-color-dark,
			var(--st-color-neutral-200)
		);
	} */
</style>
