<script>
	/** @type {string} */
	export let title;
</script>

<li>
	<h5 class='pt-2 pb-1 px-2 sticky top-0 uppercase whitespace-nowrap text-xs font-semibold text-neutral-900 dark:text-neutral-400 bg-white dark:bg-neutral-800'>
		{title}
	</h5>
	<slot/>
</li>
