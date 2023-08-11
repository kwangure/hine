<nav
	class="sticky top-0 z-40 col-start-[nav-start] col-end-[nav-end] row-start-1 row-end-2 flex items-center bg-white dark:bg-neutral-800"
>
	<button
		class="-ms-4 flex h-16 w-16 touch-manipulation select-none items-center justify-center rounded p-4 outline-none lg:hidden"
		title="Open Menu"
		aria-label="Open Menu"
	>
		<svg
			class="w-full"
			viewBox="0 0 50 40"
			role="presentation"
			focusable="false"
			aria-label="trigram for heaven symbol"
		>
			<line
				class="stroke-current stroke-2"
				x1="0"
				x2="100%"
				y1="10%"
				y2="10%"
			/>
			<line
				class="stroke-current stroke-2"
				x1="0"
				x2="100%"
				y1="50%"
				y2="50%"
			/>
			<line
				class="stroke-current stroke-2"
				x1="0"
				x2="100%"
				y1="90%"
				y2="90%"
			/>
		</svg>
	</button>
	<slot />
</nav>
<div
	class="sticky top-[var(--svui-navbar-height)] z-40 col-start-[page-start] col-end-[page-end] row-start-1 row-end-2 self-end border-b border-neutral-300 dark:border-neutral-600"
/>
