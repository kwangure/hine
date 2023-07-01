<script>
	import { Link } from '$lib/components';
	import { Section } from '$lib/components/sidebar';

	export let data;
</script>

<main class="grid h-full min-h-0 grid-cols-[max-content_minmax(500px,_1fr)]">
	<div
		class="my-2 flex h-[calc(100%-0.5em)] min-h-0 w-auto flex-col gap-1 overflow-y-auto px-1"
	>
		<Section title="test samples">
			{#each data.testSamples as sample}
				<Link href="/codegen/sample/{sample}">
					{sample}
				</Link>
			{/each}
		</Section>
	</div>
	<div
		class="grid max-h-full min-h-0 grid-cols-2 grid-rows-[max-content_1fr] items-start gap-2 px-8 py-4"
	>
		<slot />
	</div>
</main>
