<script>
	import { getSidebarContext } from './sidebar.js';
	import Icon from '../icon/simple.svelte';
	import { mdiClose } from '@mdi/js';

	const { elements, state } = getSidebarContext();
	const { hide, panel } = elements;
	const { visibility } = state;
</script>

<aside
	class="sticky top-0 z-40 col-start-[page-start] col-end-[page-end] row-start-1 row-end-3 max-h-screen overflow-y-auto lg:top-[calc(var(--svui-navbar-height)+var(--svui-navbar-y-gap))] lg:col-start-[nav-start] lg:col-end-[content-start] lg:row-start-2 lg:block lg:self-start"
	class:hidden={$visibility === 'hidden'}
	class:flex={$visibility === 'shown'}
>
	<nav
		class="flex w-72 flex-col overflow-y-auto overscroll-contain bg-white px-2 dark:bg-neutral-800"
		use:panel={{ shouldTrapFocus: () => window.innerWidth < 1024 }}
	>
		<button
			title="Close Menu"
			aria-label="Close Menu"
			class="flex h-12 w-12 touch-manipulation select-none items-center justify-center rounded p-2 lg:hidden"
			use:hide={{ focus: true }}
		>
			<Icon class="w-full" path={mdiClose} />
		</button>
		<slot />
	</nav>
	<button
		title="Close Menu"
		aria-label="Close Menu"
		use:hide
		class="flex-1 touch-manipulation bg-black/10 dark:bg-neutral-700/40 lg:hidden"
	/>
</aside>
