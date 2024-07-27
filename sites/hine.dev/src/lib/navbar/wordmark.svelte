<script>
	import { wordmark } from '@hine/assets';
</script>

<a href="/">
	<svg viewBox={wordmark.viewBox} height="20px">
		<path d={wordmark.path} fill="currentColor" />
	</svg>
</a>

<style>
	a {
		font-size: var(--st-size-5);
		line-height: var(--st-size-7);
		text-transform: uppercase;
		padding-inline: var(--st-breakpoint-lg) var(--st-size-6);
	}
</style>
