<script>
	/** @type {string} */
	export let title = '';
</script>

<section>
	{#if title}
		<div
			class="sticky top-0 pb-1 pl-2 pt-2 text-xs uppercase text-neutral-400 dark:bg-neutral-800"
		>
			{title}
		</div>
	{/if}
	<div class="flex flex-col gap-1 pl-2">
		<slot />
	</div>
</section>
