<div class="h-full grid grid-rows-1 grid-cols-[min-content_[content]_1fr]">
	<aside>
		<slot name='sidebar'></slot>
	</aside>
	<main>
		<slot/>
	</main>
</div>

<style>
	@media (max-width: 640px) {
		/*
			Overlay the sidebar over main content on small screens then toggle
			visibility of sidebar using JS
		 */
		aside, main {
			grid-area: content;
		}
	}
</style>

