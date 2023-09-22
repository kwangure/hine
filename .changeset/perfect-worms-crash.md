---
"hine": patch
---

Change Hine to accept an action config instead of an action runner.

Before:

```javascript
import { h } from "hine";

state.resolve({
  context: h.context({
    foo: "bar",
    baz: 10,
  }),
});
```

After:

```javascript
state.resolve({
  context: {
    foo: "bar",
    baz: 10,
  },
});
```

You no longer need the helper. Only the data you'd previously pass to it.
