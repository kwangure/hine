<script>
	/** @type {string} */
	export let path;
	/** @type {string | undefined} */
	let className = undefined;
	export { className as class };
</script>

<svg viewBox="0 0 24 24" class={className ?? 'h-5 w-5'}>
	<path class="fill-current" d={path} />
</svg>
