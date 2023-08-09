<script>
	import { onMount } from 'svelte';
	import { isPartiallyHidden } from '$lib/dom/dom.js';
	import List from './list.svelte';

	/** @type {import('mdast').Root} */
	export let content;

	/**
	 * @param {import('mdast').RootContent} node
	 * @returns {node is import('./types.js').HeadingWithData}
	 */
	function isHeading(node) {
		return (
			node.type === 'heading' &&
			(node.depth === 2 || node.depth === 3) &&
			!!node.data?.slug
		);
	}

	/**
	 * @param {import("mdast").RootContent[]} nodes
	 */
	function getHeadingTree(nodes) {
		/**
		 * @type {{
		 *   data: {
		 *     children: import('./types.js').HeadingWithData[]
		 *   }
		 * }}
		 */
		const dummyRoot = { data: { children: [] } };
		const stack = [dummyRoot];

		nodes.forEach((node) => {
			if (!isHeading(node)) return;
			node.data.children = [];
			// Subract 1 since headings are 1-indexed
			while (stack.length > node.depth - 1) {
				stack.pop();
			}
			stack[stack.length - 1].data.children.push(node);
			stack.push(node);
		});

		return dummyRoot.data.children;
	}

	$: headings = getHeadingTree(content.children);

	/** @type {string | undefined} */
	let activeTarget = undefined;

	const updateActiveSlug = () => {
		for (const heading of headings) {
			const element = document.getElementById(heading.data.slug);
			if (!element) continue;
			if (isPartiallyHidden(element)) continue;

			activeTarget = heading.data.slug;
			break;
		}
	};

	onMount(() => {
		document.fonts.ready.then(() => {
			// Initialize the active link
			updateActiveSlug();
			// Attach the scroll event listener to the main content
			window.addEventListener('scroll', updateActiveSlug);
		});

		return () => {
			// Remove the event listener when the component is destroyed
			window.removeEventListener('scroll', updateActiveSlug);
		};
	});

	$: console.log({ headings });
</script>

<List {activeTarget} {headings} />
