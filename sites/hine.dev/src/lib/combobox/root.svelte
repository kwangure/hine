<script lang="ts" generics="TOption">
	/* eslint-disable no-undef */
	import type { Snippet } from 'svelte';
	import {
		type CreateCombmboxConfig,
		setComboboxContext,
	} from '@svelte-thing/builders';

	const {
		children,
		...comboboxConfig
	}: {
		children: Snippet<[typeof combobox]>;
	} & CreateCombmboxConfig<TOption> = $props();
	const combobox = setComboboxContext<TOption>(comboboxConfig);
</script>

<div class="root" {...combobox.properties} use:combobox.action>
	{@render children(combobox)}
</div>

<style>
	.root {
		display: flex;
		flex-direction: column;
	}
</style>
