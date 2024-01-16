<script>
	import { page } from '$app/stores';

	$: console.log({ error: $page.error });
</script>

<h1>{$page.status}</h1>
<div>{$page.error?.message}</div>
