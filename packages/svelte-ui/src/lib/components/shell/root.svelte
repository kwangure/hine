<div
	class="grid min-h-screen grid-cols-[[nav-start]_min-content_[content-start]_1fr_[content-end]_min-content_[nav-end]] grid-rows-[var(--svui-navbar-height)_1fr] gap-y-[var(--svui-navbar-y-gap)]"
>
	<slot />
</div>

<style>
	:root {
		--svui-navbar-height: 4rem;
		--svui-navbar-y-gap: 0.5rem;
		--svui-sidebar-width: 15rem;
	}
</style>
