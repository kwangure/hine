<script>
	/** @type {boolean} */
	export let ariaHidden = true;
	/** @type {string} */
	export let path;

	/** @type {string | undefined} */
	let className = undefined;
	export { className as class };
</script>

<svg
	aria-hidden={ariaHidden}
	viewBox="0 0 24 24"
	class={className ?? 'h-5 w-5'}
>
	<path class="fill-current" d={path} />
</svg>
