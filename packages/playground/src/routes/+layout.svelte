<script>
	import './layout.css';

	import { Link, Section } from '$lib/components/sidebar/index.js';

	export let data;
</script>

<main class='h-full grid grid-cols-[max-content_minmax(500px,_1fr)]'>
	<div class="px-1 w-60">
		<Link href='/'>
			Getting started
		</Link>
		<Section title='test samples'>
			{#each data.testSamples as sample}
				<Link href='/compiler/sample/{sample}'>
					{sample}
				</Link>
			{/each}
		</Section>
	</div>
	<div class='px-8 py-4'>
		<slot/>
	</div>
</main>
