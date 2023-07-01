<script>
	export let primary = false;
</script>

{#if primary}
	<button
		class="h-9 rounded border border-blue-600 bg-blue-600 px-3 text-white hover:bg-blue-500 dark:border-neutral-800 dark:bg-blue-600 dark:hover:bg-blue-500"
		on:click
	>
		<slot />
	</button>
{:else}
	<button
		class="h-9 rounded border border-neutral-300 bg-neutral-100 px-3 hover:bg-neutral-200 dark:border-neutral-500 dark:bg-neutral-700 dark:hover:bg-neutral-600"
		on:click
	>
		<slot />
	</button>
{/if}
