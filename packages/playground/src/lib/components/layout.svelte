<main class="grid h-full grid-cols-[max-content_minmax(500px,_1fr)]">
	<div
		class="my-2 flex h-[calc(100%-0.5em)] min-h-0 w-auto flex-col gap-1 overflow-y-auto px-1"
	>
		<slot name="sidebar" />
	</div>
	<div class="px-8 py-4">
		<slot />
	</div>
</main>
