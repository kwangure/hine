<script>
	import { createDropdownMenu } from '@melt-ui/svelte';
	import { writable } from 'svelte/store';

	/** @type {NonNullable<import('@melt-ui/svelte').CreateDropdownMenuProps['positioning']>['placement'] | undefined} */
	export let placement = undefined;

	const open = writable(false);
	const {
		elements: { menu, item, trigger, arrow },
	} = createDropdownMenu({
		forceVisible: true,
		loop: true,
		open,
		positioning: { placement },
	});
</script>


<slot name="trigger" trigger={{ props: $trigger, action: trigger }}></slot>

{#if $open}
	<slot
		arrow={{ props: $arrow, action: arrow }}
		close={close}
		item={{ props: $item, action: item }}
		menu={{ props: $menu, action: menu }}
		open={open}
	></slot>
{/if}