<script>
	import Icon from './simple.svelte';

	/** @type {string} */
	export let href;
	/** @type {string} */
	export let label;
	/** @type {string} */
	export let path;
	/** @type {'_blank' | '_parent' | '_self' | '_top' | undefined} */
	export let target = undefined;

	$: rel = target === '_blank' ? 'noopener' : undefined;
</script>

<a class="p-2 block rounded hover:bg-neutral-200 dark:hover:bg-neutral-700" {href} title={label} {target} {rel}>
	<Icon path={path} />
	<span class="sr-only">{label}</span>
</a>
