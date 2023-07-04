<script>
	import './layout.css';
	import { Link } from '$lib/components';
</script>

<div class="grid h-full grid-rows-[max-content_1fr]">
	<nav class="px-6">
		<div class="inline-flex gap-1">
			<Link href="/parser">Parser</Link>
			<Link href="/compiler">Compiler</Link>
			<Link href="/state-codegen">State Codegen</Link>
		</div>
	</nav>
	<slot />
</div>
