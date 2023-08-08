<script>
	import { onMount } from 'svelte';

	/** @type {import('mdast').Root} */
	export let content;

	/**
	 * @param {import('mdast').RootContent} node
	 * @returns {node is import('mdast').Heading & { data: import('mdast').HeadingData }}
	 */
	function isHeading(node) {
		return (
			node.type === 'heading' &&
			(node.depth === 2 || node.depth === 3) &&
			!!node.data?.slug
		);
	}

	$: headings = content.children.filter(isHeading);

	/** @type {string | null} */
	let activeSlug = null;

	const updateActiveSlug = () => {
		headings.forEach((heading) => {
			const element = document.getElementById(heading.data.slug);
			if (!element) return;

			const rect = element.getBoundingClientRect();
			if (
				rect.top <= window.innerHeight / 2 &&
				rect.bottom >= window.innerHeight / 2
			) {
				activeSlug = heading.data.slug;
			}
		});
	};

	onMount(() => {
		let content = /** @type {HTMLElement} */ (document.querySelector('main'));
		document.fonts.ready.then(() => {
			// Initialize the active link
			updateActiveSlug();
			// Attach the scroll event listener to the main content
			content.addEventListener('scroll', updateActiveSlug);
		});

		return () => {
			// Remove the event listener when the component is destroyed
			content.removeEventListener('scroll', updateActiveSlug);
		};
	});
</script>

{#if headings.length}
	<aside class="sticky top-0 self-start px-8">
		<h2 class="uppercase">On this page</h2>
		<nav>
			<ul>
				{#each headings as heading}
					<li>
						<a
							href={`#${heading.data?.slug}`}
							class="block border-l pl-2"
							class:text-slate-500={activeSlug === heading.data?.slug}
							class:pl-5={heading.depth === 3}
						>
							{heading.data?.content}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</aside>
{/if}
