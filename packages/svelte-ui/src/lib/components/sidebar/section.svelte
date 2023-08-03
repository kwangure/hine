<script>
	/** @type {string} */
	export let title;
</script>

<li>
	<h5
		class="sticky top-0 whitespace-nowrap bg-white px-2 pb-1 pt-2 text-xs font-semibold uppercase text-neutral-900 dark:bg-neutral-800 dark:text-neutral-400"
	>
		{title}
	</h5>
	<slot />
</li>
