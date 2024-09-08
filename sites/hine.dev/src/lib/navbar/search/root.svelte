<script lang="ts">
	import { goto } from '$app/navigation';
	import { createSearch } from './search.svelte';
	import { Icon } from '@svelte-thing/components';
	import { mdiMagnify, mdiClose } from '@mdi/js';
	import Dialog from '../../dialog.svelte';
	import Tokens from './tokens.svelte';
	import * as Combobox from '$lib/combobox';

	const { dialog, filter } = createSearch();
	const { trigger, close } = dialog.elements;
</script>

<button use:trigger {...$trigger}>
	<Icon.Simple path={mdiMagnify} />
	<span>Search</span>
</button>

<Dialog component={dialog}>
	<Combobox.Root
		{filter}
		label="Search"
		onchange={(value) => value && goto(`/guide/${value._id}`)}
	>
		{#snippet children({ elements, state })}
			<div class="input" class:active={!state.activeItem}>
				<div class="search">
					<Icon.Simple path={mdiMagnify} />
				</div>
				<Combobox.Input placeholder="Search..." />
				<div class="close">
					<Icon.Button action={close} label="Close" path={mdiClose} />
				</div>
			</div>
			{#if elements.input?.state.value}
				<div class="results">
					{#each state.filteredOptions as result}
						<Combobox.Item value={result}>
							<a href="/guide/{result._id}" use:close>
								<div class="title">
									<Tokens tokens={result.title} />
								</div>
								<div class="content">
									{#each result._content as sentence}
										<Tokens tokens={sentence.words} />
									{/each}
								</div>
							</a>
						</Combobox.Item>
					{:else}
						<div class="no-results">
							<Icon.Simple
								path={mdiMagnify}
								--st-icon-height="var(--st-size-8)"
								--st-icon-width="var(--st-size-8)"
							/>
							No results found for "{elements.input.state.value.trim()}".
						</div>
					{/each}
				</div>
			{/if}
		{/snippet}
	</Combobox.Root>
</Dialog>

<style>
	button {
		align-items: center;
		--_border-color-dark: var(--st-color-preference-dark)
			var(--st-color-neutral-600);
		border-color: var(--_border-color-dark, var(--st-color-neutral-300));
		border-radius: var(--st-size-1);
		--_border-width-lg: var(--st-breakpoint-lg) 1px;
		border-width: var(--_border-width-lg, 0px);
		cursor: pointer;
		display: flex;
		gap: var(--st-size-1);
		--_margin-inline-end-lg: var(--st-breakpoint-lg) var(--st-size-1);
		margin-inline-end: var(--_margin-inline-end-lg, 0);
		padding-block: var(--st-size-1);
		--_padding-inline-lg: var(--st-breakpoint-lg) var(--st-size-3);
		padding-inline: var(--_padding-inline-lg, var(--st-size-2));
		--_width-lg: var(--st-breakpoint-lg) var(--st-size-56);
		width: var(--_width-lg, auto);
	}
	button:hover {
		--_background-color-dark: var(--st-color-preference-dark)
			var(--st-color-neutral-700);
		background-color: var(
			--_background-color-dark,
			var(--st-color-neutral-200)
		);
	}
	.input {
		align-items: center;
		display: grid;
		grid-template-columns: max-content 1fr max-content;
		flex-shrink: 0;
		height: var(--st-size-12);
	}
	.input:not(.active) {
		--_background-color-dark: var(--st-color-preference-dark)
			rgba(255, 255, 255, 0.05);
		background-color: var(--_background-color-dark, rgba(0, 0, 0, 0.1));
	}
	.search,
	.close {
		align-items: center;
		justify-content: center;
		display: flex;
		width: var(--st-size-12);
		height: 100%;
	}
	.results {
		--_border-color-dark: var(--st-color-preference-dark)
			var(--st-color-neutral-600);
		border-color: var(--_border-color-dark, var(--st-color-neutral-400));
		border-top-width: 1px;
		display: flex;
		flex-direction: column;
		gap: var(--st-size-2);
		padding: var(--st-size-2);
	}
	a {
		border-radius: var(--st-size-2);
		cursor: pointer;
		padding: var(--st-size-2);
		width: 100%;
	}
	.no-results {
		align-items: center;
		--_color-dark: var(--st-color-preference-dark)
			var(--st-color-neutral-400);
		color: var(--_color-dark, var(--st-color-neutral-500));
		display: flex;
		flex-direction: column;
	}
	.content {
		--_color-dark: var(--st-color-preference-dark)
			var(--st-color-neutral-400);
		color: var(--_color-dark, var(--st-color-neutral-500));
		overflow-x: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	:global([data-active-item]) .content {
		--_color-dark: var(--st-color-preference-dark)
			var(--st-color-neutral-500);
		color: var(--_color-dark, var(--st-color-neutral-500));
	}
</style>
