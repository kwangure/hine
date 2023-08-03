<div class="grid h-full grid-cols-[min-content_[content]_1fr] grid-rows-1">
	<aside>
		<slot name="sidebar" />
	</aside>
	<main>
		<slot />
	</main>
</div>

<style>
	@media (max-width: 640px) {
		/*
			Overlay the sidebar over main content on small screens then toggle
			visibility of sidebar using JS
		 */
		aside,
		main {
			grid-area: content;
		}
	}
</style>
