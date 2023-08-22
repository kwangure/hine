<script>
	import { getSidebarContext } from '../sidebar/sidebar.js';
	import Icon from '../icon/simple.svelte';
	import { mdiMenu } from '@mdi/js';

	const { elements } = getSidebarContext();
	const { show } = elements;
</script>

<nav
	class="sticky top-0 z-40 col-start-[nav-start] col-end-[nav-end] row-start-1 row-end-2 flex items-center bg-white dark:bg-neutral-800"
>
	<button
		class="-ms-4 flex h-12 w-12 touch-manipulation select-none items-center justify-center rounded p-2 lg:hidden"
		title="Open Menu"
		aria-label="Open Menu"
		use:show={{ focus: true }}
	>
		<Icon class="w-full" path={mdiMenu} />
	</button>
	<slot />
</nav>
<div
	class="sticky top-[var(--svui-navbar-height)] z-40 col-start-[page-start] col-end-[page-end] row-start-1 row-end-2 self-end border-b border-neutral-300 dark:border-neutral-600"
/>
