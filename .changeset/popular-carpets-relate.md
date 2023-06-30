---
'parserer': patch
---

Implement nesting block statement inside elements. The following is now possible:

```svelte
<div>
	{#if true}{/if}
</div>
```
