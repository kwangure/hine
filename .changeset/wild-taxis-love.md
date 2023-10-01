---
"hine": patch
---

Changed `Context` to use types instead of transformers to infer values

Before:

```js
import { state } from "hine";

const foo = state({
	context: {
		key1: String,
		key2: Number,
	},
});
```

After:

```ts
import { state } from "hine";

const foo = state({
	types: {
		context: {} as {
			key1: string;
			key2: number;
		},
	},
});
```
