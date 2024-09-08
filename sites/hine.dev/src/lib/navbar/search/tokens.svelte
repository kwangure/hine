<script lang="ts">
	export let tokens: [string, boolean][];
</script>

{#each tokens as [word, isMatch]}
	{#if isMatch}
		<mark>{word}</mark>
	{:else}
		{word}
	{/if}
{/each}

<style>
	mark {
		--_color-dark: var(--st-color-preference-dark)
			var(--st-color-neutral-400);
		color: var(--_color-dark, var(--st-color-neutral-700));
		background-color: unset;
	}
	:global([data-active-item]) mark {
		--_color-dark: var(--st-color-preference-dark)
			var(--st-color-neutral-700);
		color: var(--_color-dark, var(--st-color-neutral-700));
	}
</style>
