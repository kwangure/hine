<script lang="ts">
	import {
		createDropdownMenu,
		type CreateDropdownMenuProps,
	} from '@melt-ui/svelte';
	import { writable } from 'svelte/store';

	type Placement = NonNullable<
		NonNullable<CreateDropdownMenuProps['positioning']>['placement']
	>;
	export let placement: Placement | undefined = undefined;

	const open = writable(false);
	const {
		elements: { menu, item, trigger, arrow },
	} = createDropdownMenu({
		forceVisible: true,
		loop: true,
		open,
		positioning: { placement: placement as Placement },
	});
</script>

<slot name="trigger" trigger={{ props: $trigger, action: trigger }} />

{#if $open}
	<slot
		arrow={{ props: $arrow, action: arrow }}
		{close}
		item={{ props: $item, action: item }}
		menu={{ props: $menu, action: menu }}
		{open}
	/>
{/if}
