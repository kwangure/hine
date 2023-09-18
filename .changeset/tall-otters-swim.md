---
"hine": patch
---

Change Hine to accept an action config instead of an action runner.

Before:

```javascript
import { h } from "hine";

state.resolve({
  actions: {
    action: h.action(({ context }) => {
      console.log({ context });
    }),
  },
});
```

After:

```javascript
state.resolve({
  actions: {
    action: ({ context }) => {
      console.log({ context });
    },
  },
});
```

You no longer need the helper. Only the config, you'd previously pass to it.
