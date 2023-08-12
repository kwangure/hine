<script>
	/** @type {string} */
	export let title;
</script>

<h5
	class="sticky top-0 whitespace-nowrap bg-white pb-1 pt-2 text-xs font-semibold uppercase text-neutral-900 dark:bg-neutral-800 dark:text-neutral-400"
>
	{title}
</h5>
<ul class="flex flex-col gap-1">
	<slot />
</ul>
