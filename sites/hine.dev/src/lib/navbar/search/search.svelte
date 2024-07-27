<script>
	import { Icon } from '@svelte-thing/components';
	import { mdiMagnify, mdiClose } from '@mdi/js';
	import { createSearch } from './search';
	import Dialog from '../../dialog.svelte';
	import Tokens from './tokens.svelte';

	const { inputs, outputs } = createSearch();
	const { query } = inputs;
	const { dialog, searchResults } = outputs;
	const { trigger, close } = dialog.elements;
</script>

<button use:trigger {...$trigger}>
	<Icon.Simple path={mdiMagnify} />
	<span>Search</span>
</button>

<Dialog component={dialog}>
	<div class="input">
		<div class="search">
			<Icon.Simple path={mdiMagnify} />
		</div>
		<input type="text" placeholder="Search..." bind:value={$query} />
		<div class="close">
			<Icon.Button action={close} label="Close" path={mdiClose} />
		</div>
	</div>
	{#if $query.trim()}
		<div class="results">
			{#each $searchResults as result}
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
			{:else}
				<div class="no-results">
					<Icon.Simple
						path={mdiMagnify}
						--st-icon-height="var(--st-size-8)"
						--st-icon-width="var(--st-size-8)"
					/>
					No results found for "{$query.trim()}".
				</div>
			{/each}
		</div>
	{/if}
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
	span {
		--_display-lg: var(--st-breakpoint-lg) inline;
		display: var(--_display-lg, none);
		--_opacity-lg: var(--st-breakpoint-lg) 0.75;
		opacity: var(--_opacity-lg, 1);
	}
	.input {
		align-items: center;
		display: grid;
		grid-template-columns: max-content 1fr max-content;
		flex-shrink: 0;
		height: var(--st-size-12);
	}
	.search,
	.close {
		align-items: center;
		justify-content: center;
		display: flex;
		width: var(--st-size-12);
		height: 100%;
	}
	input {
		border: none;
		border: 0px;
		inset: 0px;
		height: 100%;
		line-height: var(--st-size-12);
		padding-inline: var(--st-size-1);
		outline: none;
	}
	input:focus-visible {
		outline: initial;
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
	}
	a:hover {
		--_background-color-dark: var(--st-color-preference-dark)
			var(--st-color-neutral-700);
		background-color: var(
			--_background-color-dark,
			var(--st-color-neutral-200)
		);
	}
	.no-results {
		align-items: center;
		--_color-dark: var(--st-color-preference-dark)
			var(--st-color-neutral-400);
		color: var(--_color-dark, var(--st-neutral-500));
		display: flex;
		flex-direction: column;
	}
	.content {
		--_color-dark: var(--st-color-preference-dark)
			var(--st-color-neutral-400);
		color: var(--_color-dark, var(--st-neutral-500));
		overflow-x: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>
