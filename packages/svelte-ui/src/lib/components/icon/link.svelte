<script>
	import Icon from './simple.svelte';

	/** @type {string} */
	export let href;
	/** @type {string} */
	export let label;
	/** @type {string} */
	export let path;

</script>

<a class="p-2 block rounded hover:bg-neutral-200 dark:hover:bg-neutral-700" {href} title={label}>
	<Icon path={path} />
	<span class="sr-only">{label}</span>
</a>
