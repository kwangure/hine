<script>
	import { Link, Section } from '$lib/components/sidebar';
	import { Layout } from '$lib/components';

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
