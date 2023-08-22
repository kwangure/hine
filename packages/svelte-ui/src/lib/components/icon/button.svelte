<script>
	import Icon from './simple.svelte';

	/** @type {string} */
	export let label;
	/** @type {string} */
	export let path;
	/** @type {(node: HTMLElement) => any} */
	export let use = () => {};
</script>

<button use:use class="p-2 block rounded hover:bg-neutral-200 dark:hover:bg-neutral-700" title={label}>
	<Icon path={path} />
	<span class="sr-only">{label}</span>
</button>
