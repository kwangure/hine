<script>
	import { Layout, Link } from '$lib/components';
	import { Section } from '$lib/components/sidebar';

	export let data;
</script>

<Layout>
	<Section slot="sidebar" title="test samples">
		{#each data.testSamples as sample}
			<Link href="/parser/sample/{sample}">
				{sample}
			</Link>
		{/each}
	</Section>
	<slot />
</Layout>
