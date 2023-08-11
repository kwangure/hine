<script>
	import { createEventForwarder, createTextCopier } from '../creators/index.js';
	import { Icon } from './index.js';
	import { mdiContentCopy, mdiCheck } from '@mdi/js';

	/** @type {string | undefined} */
	export let label;
	/** @type {string | (() => string)} */
	export let text;

	const forward = createEventForwarder();
	const { isCopied, copy } = createTextCopier();
</script>

<button
	use:forward
	title={label}
	aria-label={label}
	class="px-1"
	on:click={() => copy(typeof text === 'function' ? text() : text)}
>
	{#if $isCopied}
		<Icon path={mdiCheck} />
	{:else}
		<Icon path={mdiContentCopy} />
	{/if}
</button>
