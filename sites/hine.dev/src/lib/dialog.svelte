<script lang="ts">
	import { type createDialog } from '@melt-ui/svelte';

	type MeltDialog = ReturnType<typeof createDialog>;

	export let component: MeltDialog;

	$: ({
		states: { open },
		elements: { content, overlay, portalled },
	} = component);
</script>

{#if $open}
	<div class="dialog" {...$portalled} use:portalled>
		<div {...$overlay} use:overlay></div>
		<div {...$content} use:content>
			<slot />
		</div>
	</div>
{/if}

<style>
	.dialog :global([data-melt-dialog-overlay]) {
		--_background-color-dark: var(--st-color-preference-dark)
			rgba(0, 0, 0, 0.5);
		background-color: var(--_background-color-dark, rgba(50, 50, 50, 0.5));
		bottom: 0;
		left: 0;
		position: fixed;
		right: 0;
		top: 0;
		z-index: 50;
	}

	.dialog :global([data-melt-dialog-content]) {
		--_background-color-dark: var(--st-color-preference-dark)
			var(--st-color-neutral-800);
		background-color: var(--_background-color-dark, white);
		--_box-shadow-dark: var(--st-color-preference-dark) 0 10px 15px -3px rgb(0
						0 0 / 0.25),
			0 4px 6px -4px rgb(0 0 0 / 0.1);
		box-shadow: var(
			--_box-shadow-dark,
			0 10px 15px -3px rgb(0 0 0 / 0.1),
			0 4px 6px -4px rgb(0 0 0 / 0.1)
		);
		border-radius: var(--st-size-2);
		position: fixed;
		top: 12vh;
		left: 50%;
		transform: translateX(-50%);
		width: 90vw;
		max-width: 35rem /* 560px */;
		max-height: min(70vh, 35rem /* 560px */);
		z-index: 50;
		display: flex;
		flex-direction: column;
	}
</style>
