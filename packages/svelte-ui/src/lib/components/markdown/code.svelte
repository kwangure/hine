<script>
	import '../../code/code.css';
	import { isScrollableX, isScrollableY } from '../../dom/dom.js';
	import { highlightLines } from '../../code/index.js';
	import Copy from '../../components/copy.svelte';
	import { multiHighlight } from '../../code/multi-language.js';

	/** @type {import('mdast').Code} */
	export let node;

	/** @type {number | undefined} */
	let hoverRange = undefined;

	$: language = node.lang ?? undefined;
	$: highlightedLines = highlightLines(node.value, (code, options) =>
		multiHighlight(code, language, options),
	);
	$: copyRanges = parseRanges(
		typeof /** @type {any} */(node.data?.attributes).copy === 'string'
			? /** @type {{ copy: string }} */(node.data?.attributes).copy
			: '',
	);
	$: lines = enrichLineRanges(highlightedLines, copyRanges);

	/**
	 * TODO: Extract and test
	 *
	 * @template {Record<any, any>} T
	 * @param {T[][]} lines
	 * @param {[number, number][]} ranges
	 */
	function enrichLineRanges(lines, ranges) {
		/** @type {Map<number, Set<number>>} */
		const rangeMap = new Map();

		// Construct a Map where each key is a line number
		// and each value is a set of range indexes.
		ranges.forEach(([start], index) => {
			if (!rangeMap.has(start)) {
				rangeMap.set(start, new Set());
			}
			rangeMap.get(start)?.add(index);
		});

		const enrichedLines = lines.map((line, index) => {
			const lineNumber = index + 1; // line numbers are 1-indexed;
			const segmentRanges = rangeMap.get(lineNumber);
			const ranges = [...(segmentRanges || [])];
			return { ranges, segments: line };
		});

		return enrichedLines;
	}

	/**
	 * TODO: Extract and test
	 *
	 * @param {string} string
	 */
	function parseRanges(string) {
		/** @type {[number, number][]} */
		const result = [];
		if (!string) return result;

		const parts = string.split(',').map((part) => part.trim());

		parts.forEach((part) => {
			if (part.includes('-')) {
				const [start, end] = part.split('-').map(Number);
				result.push([start, end]);
			} else {
				const num = Number(part);
				result.push([num, num]);
			}
		});

		return result;
	}

	/** @param {number} rangeIndex */
	function getCopyText(rangeIndex) {
		const [start, end] = copyRanges[rangeIndex];
		const lines = node.value.split('\n');
		return lines.slice(start - 1, end).join('\n');
	}

	/**
	 * @param {number | undefined} hoverRange
	 * @param {number} index
	 */
	function checkRange(hoverRange, index) {
		if (hoverRange === undefined)
			return {
				isEnd: false,
				isInRange: false,
				iStart: false,
			};
		const [start, end] = copyRanges[hoverRange];
		const lineNumber = index + 1;
		return {
			isEnd: lineNumber === end,
			isInRange: start <= lineNumber && lineNumber <= end,
			isStart: lineNumber === start,
		};
	}

	/**
	 * Make overflowing element focusable to allow keyboard users to scroll
	 * using arrow keys
	 *
	 * @param {HTMLElement} node
	 */
	function overflowFocusable(node) {
		function checkOverflow() {
			// I imagine this would be commonly used for handling horizontal
			// keyboard scrolling so we start with X
			if (isScrollableX(node) || isScrollableY(node)) {
				node.setAttribute('tabindex', '0');
			} else {
				node.removeAttribute('tabindex');
			}
		}

		const resizeObserver = new ResizeObserver(checkOverflow);
		resizeObserver.observe(node);

		const mutationObserver = new MutationObserver(checkOverflow);
		mutationObserver.observe(node, {
			childList: true,
			subtree: true,
			characterData: true,
		});

		checkOverflow();

		return {
			destroy() {
				resizeObserver.disconnect();
				mutationObserver.disconnect();
			},
		};
	}
</script>

<code
	class="mb-2 mt-4 grid grid-cols-[1fr_max-content] overflow-auto whitespace-pre rounded border border-neutral-600 bg-zinc-800 py-4 pl-3 pr-5 text-sm leading-6 text-neutral-200 dark:border-neutral-600 dark:bg-zinc-900"
	use:overflowFocusable
	on:mouseleave={() => (hoverRange = undefined)}
>
	{#each lines as { ranges, segments }, i}
		{@const { isEnd, isInRange, isStart } = checkRange(hoverRange, i)}
		<div
			class="pl-2"
			class:to-copy={isInRange}
			class:rounded-t={isStart}
			class:rounded-b={isEnd}
		>
			{#each segments as { color, segment }}
				<span class={color}>{segment}</span>
			{/each}
		</div>
		<div class="item-center flex px-1">
			{#each ranges as range}
				{@const label =
					copyRanges[range][0] === copyRanges[range][1]
						? `Copy line ${copyRanges[range][0]}`
						: `Copy line ${copyRanges[range][0]} to ${copyRanges[range][1]}`}
				<Copy
					{label}
					text={() => getCopyText(range)}
					on:mouseleave={() => (hoverRange = undefined)}
					on:mouseenter={() => (hoverRange = range)}
				/>
			{/each}
		</div>
	{/each}
</code>

<style>
	@media (prefers-color-scheme: light) {
		.to-copy {
			background-color: rgba(0, 0, 0, 0.1);
		}
	}
	@media (prefers-color-scheme: dark) {
		.to-copy {
			background-color: rgba(255, 255, 255, 0.1);
		}
	}
</style>
