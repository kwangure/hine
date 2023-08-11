<aside
	class="sticky top-[calc(var(--svui-navbar-height)+var(--svui-navbar-y-gap))] col-start-[nav-start] col-end-[content-start] row-start-2 row-end-3 hidden max-h-screen w-72 self-start overflow-y-auto lg:block"
>
	<nav class="flex flex-col overflow-y-auto overscroll-contain px-2">
		<button
			title="Close Menu"
			aria-label="Close Menu"
			class="flex h-16 w-16 touch-manipulation select-none items-center justify-center rounded p-4 outline-none lg:hidden"
		>
			<svg
				class="w-full"
				viewBox="0 0 50 50"
				role="presentation"
				focusable="false"
				aria-label="Close symbol"
			>
				<line x1="10%" y1="10%" x2="90%" y2="90%" />
				<line x1="90%" y1="10%" x2="10%" y2="90%" />
			</svg>
		</button>
		<slot />
	</nav>
</aside>
